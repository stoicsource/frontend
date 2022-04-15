<template>
  <div>
    <table v-if="work && tocEntry" class="table">
      <tr>
        <td class="translation-section">
          <div class="translation-content">
            <p v-if="getContentItem(tocEntry, edition) && getContentItem(tocEntry, edition).title > ''">
              <strong>{{ getContentItem(tocEntry, edition).title }}</strong>
            </p>
            <p v-for="paragraph in getContent(tocEntry, edition).split('\n')" :key="paragraph">{{ paragraph }}</p>
            <p v-if="getContentItem(tocEntry, edition) && getContentItem(tocEntry, edition).notes > ''" class="translator-notes">
              {{ getContentItem(tocEntry, edition).notes }}
            </p>
            <p v-if="isLoading">
              <b-spinner label="Loading..."></b-spinner>
            </p>
            <div>
              <span class="content-action" @click="linkTranslation(tocEntry, edition)" title="link"><font-awesome-icon icon="link"/></span>
              <span class="content-action" @click="quoteTranslation(tocEntry, edition)" title="quote"><font-awesome-icon icon="quote-right"/></span>
              <!--<span class="content-action" @click="quoteTranslation(tocEntry, edition)" title="show translator notes"><font-awesome-icon icon="comment-alt"/></span>-->
              <!-- getContent(tocEntry, edition) -->
            </div>
          </div>

        </td>
      </tr>
    </table>

    <b-modal id="quote-modal" title="Quote Translation">
      <div>Markdown quote (can be pasted to reddit and other platforms)</div>
      <textarea v-model="quoteText" rows="10" style="width: 100%;" id="text-to-copy"></textarea>
      <template #modal-footer="{ ok, cancel }">
        <b-button size="sm" variant="primary" @click="ok()" id="copy-button" data-clipboard-target="#text-to-copy">
          Copy to Clipboard
        </b-button>
        <b-button size="sm" variant="secondary" @click="cancel()">
          Close
        </b-button>
      </template>
    </b-modal>

    <div class="bottom-nav bg-light" v-if="work && tocEntry">
      <b-button @click="previousTocEntry()" v-if="tocEntry.hasPrevious()" variant="outline-secondary">
        <font-awesome-icon icon="arrow-alt-circle-up"/>
      </b-button>
      <span><strong>{{ tocEntry.label }}</strong></span>
      <a @click="nextTocEntry" v-if="tocEntry.hasNext()" class="btn btn-outline-secondary btn-sm hover-button">
        <font-awesome-icon icon="arrow-alt-circle-down"/>
      </a>

    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2'
import Work from "@/store/models/Work";
import Content from "@/store/models/Content";
// import Edition from "@/store/models/Edition";
import TocEntry from "@/store/models/TocEntry";
import SelectionInfo from "@/store/models/SelectionInfo";
import WorkService from "@/services/WorkService";
import {mapMutations} from "vuex";

export default {
  props: {
    workSlug: String,
    tocSlug: String,
    workId: Number,
    editionIds: Array,
    tocEntryIds: Array,
  },
  components: {},
  data () {
    return {
      isLoading: false,
      lastRequestParamString: '',
      quoteText: ''
    }
  },
  created () {
    // watch the params of the route to fetch the data again
    this.$watch(
        () => this.$route.params,
        () => {
          this.fetchData()
        },
        // fetch the data when the view is created and the data is
        // already being observed
        {immediate: true}
    )
  },

  computed: {
    work () {
      return Work.query().where('url_slug', this.workSlug).with(['editions', 'tocEntries.work.tocEntries', 'authors']).first();
    },

    edition () {
      return this.work ? this.work.editions[0] : null;
    },

    tocEntry () {
      let tocSlug = this.tocSlug ? this.tocSlug : (this.work && this.work.tocEntries.length > 0 ? this.work.tocEntries[0].label : null);
      return TocEntry.query().where('work_id', this.work.id).where('label', tocSlug).with(['work.tocEntries']).first();
    },

    selectionInfo () {
      return SelectionInfo.find(this.workId);
    }
  },
  methods: {
    ...mapMutations('app', ['setActiveWork']),

    fetchData () {
      let work = Work.query().where('url_slug', this.$route.params.workSlug).first()
      WorkService.loadFullWork(work);
      this.setActiveWork(work);
    },

    async loadContents () {
      if (!this.isLoading &&
          this.edition && this.tocEntry
      ) {
        let editionParams = 'editions[]=' + this.edition.id;
        let tocParams = 'toc_entries[]=' + this.tocEntry.id;

        let paramString = editionParams + '&' + tocParams;

        if (paramString !== this.lastRequestParamString) {
          this.isLoading = true;
          await Content.api().get(process.env.VUE_APP_API_URL + '/contents?' + paramString);
          this.isLoading = false;
          this.lastRequestParamString = paramString;
        }
      }
    },

    getContentItem (tocEntry, edition) {
      return Content.query()
          .where('toc_entry_id', tocEntry.id)
          .where('edition_id', edition.id)
          .first();
    },

    getContent (tocEntry, edition) {
      let contentItem = this.getContentItem(tocEntry, edition)

      if (!contentItem) {
        this.loadContents();
        return '...';
      } else {
        return contentItem.content;
      }
    },

    previousTocEntry () {
      let previousEntry = this.tocEntry ? this.tocEntry.getPrevious() : null;
      if (previousEntry) {
        this.$router.push({
          name: 'contentByToc', params: {
            author: this.work.authors[0].url_slug,
            workSlug: this.work.url_slug,
            tocSlug: previousEntry.label
          }
        });
      }
    },

    nextTocEntry () {
      let nextEntry = this.tocEntry ? this.tocEntry.getNext() : null;
      if (nextEntry) {
        this.$router.push({
          name: 'contentByToc', params: {
            author: this.work.authors[0].url_slug,
            workSlug: this.work.url_slug,
            tocSlug: nextEntry.label
          }
        });
      }
    },

    linkTranslation (tocEntry, edition) {
      let editionAuthor = edition.authors[0];
      let link = window.location.origin + '/' + edition.work.url_slug + '/' + tocEntry.label + '/' + editionAuthor.url_slug;

      Swal.fire({
        title: 'Link to this content:',
        input: 'text',
        inputValue: link,
        showCancelButton: false,
        confirmButtonText: 'Close'
      });
    },

    quoteTranslation (tocEntry, edition) {
      let content = this.getContent(tocEntry, edition);
      let editionAuthor = edition.authors[0];
      let workAuthor = edition.work.authors[0];
      let link = window.location.origin + '/' + edition.work.url_slug + '/' + tocEntry.label + '/' + editionAuthor.url_slug;

      let markdown = '> ' + content + "\n";
      let authorInfo = '*' + workAuthor.shortName + ', ' + edition.work.name + ' ' + tocEntry.label + ' (Trans. by ' + editionAuthor.name + ')*';
      markdown += '[' + authorInfo + '](' + link + ')';

      this.quoteText = markdown;
      this.$bvModal.show('quote-modal');
    }
  }
}
</script>

<style lang="scss" scoped>
.table th, .table td {

  &:nth-child(2) {
    padding-left: 0;
  }

  &:last-child {
    padding-right: 0;
  }
}

.table th {
  font-weight: 500;
}

.toc-label-cell {
  .hover-button {
    visibility: hidden;
  }

  &:hover {
    .hover-button {
      visibility: visible;
    }
  }
}

.btn {
  display: block;
}

.translation-section {
  .translation-content {
    max-width: 35em;
    line-height: 1.6em;

    .content-action {
      visibility: hidden;
      display: inline-block;
      padding: 0 5px;
      color: gray;
      cursor: pointer;
      border: 1px solid lightgray;
      border-radius: 6px;

      &:not(:first-child) {
        margin-left: 0.5em;
      }
    }

    &:hover {
      .content-action {
        visibility: visible;
      }
    }
  }

  .translator-notes {
    font-size: 0.8em;
    line-height: 1.3em;
    font-style: italic;
    color: #444;
  }
}

.bottom-nav {
  position: fixed;
  left: 0;
  bottom: 20px;
  width: 100vw;
  min-height: 34px;
  display: flex;
  flex-direction: row;

}
</style>

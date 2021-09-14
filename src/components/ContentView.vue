<template>
  <div>
    <table class="table">
      <tr :class="{ 'd-none d-lg-table-row' : editions.length === 1 }">
        <th class="d-none d-lg-table-cell"></th>
        <th v-for="edition in editions" :key="edition.id">{{ edition.authorsFormatted }} <span class="d-none d-md-inline">({{ edition.year }})</span></th>
      </tr>

      <tr v-for="tocEntry in tocEntries" :key="tocEntry.id">
        <td class="d-none d-lg-table-cell text-center toc-label-cell">
          <a @click="previousTocEntry(tocEntry)" v-if="tocEntries.length === 1 && tocEntry.hasPrevious()" class="btn btn-outline-secondary btn-sm hover-button">Previous</a>
          {{ tocEntry.label }}<br>
          <a @click="deselectTocEntry(tocEntry)" v-if="tocEntries.length > 1" class="btn btn-outline-secondary btn-sm hover-button">X</a>
          <a @click="nextTocEntry(tocEntry)" v-if="tocEntries.length === 1 && tocEntry.hasNext()" class="btn btn-outline-secondary btn-sm hover-button">Next</a>
        </td>
        <td v-for="(edition, index) in editions" :key="edition.id" class="translation-section">
          <div class="translation-content">
            <p v-if="getContentItem(tocEntry, edition) && getContentItem(tocEntry, edition).title > ''">
              <strong>{{ getContentItem(tocEntry, edition).title }}</strong>
            </p>
            <div class="mobile-controls d-lg-none bg-light" v-if="index === 0">
              <span><strong>{{ tocEntry.label }}</strong></span>
              <a @click="previousTocEntry(tocEntry)" v-if="tocEntries.length === 1 && tocEntry.hasPrevious()" class="btn btn-outline-secondary btn-sm hover-button">
                <font-awesome-icon icon="arrow-alt-circle-up"/>
              </a>
              <a @click="deselectTocEntry(tocEntry)" v-if="tocEntries.length > 1" class="btn btn-outline-secondary btn-sm hover-button">
                <font-awesome-icon icon="times-circle"/>
              </a>
              <a @click="nextTocEntry(tocEntry)" v-if="tocEntries.length === 1 && tocEntry.hasNext()" class="btn btn-outline-secondary btn-sm hover-button">
                <font-awesome-icon icon="arrow-alt-circle-down"/>
              </a>
            </div>
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
  </div>
</template>

<script>
import Swal from 'sweetalert2'
import Content from "@/store/models/Content";
import Edition from "@/store/models/Edition";
import TocEntry from "@/store/models/TocEntry";
import SelectionInfo from "@/store/models/SelectionInfo";

export default {
  props: {
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
  computed: {
    editions () {
      return Edition.query().whereIdIn(this.editionIds).with(['authors', 'work.authors']).orderBy('year').get();
    },

    tocEntries () {
      return TocEntry.query().whereIdIn(this.tocEntryIds).with('work.tocEntries').orderBy(tocEntry => isNaN(Number(tocEntry.label)) ? tocEntry.label : Number(tocEntry.label)).get();
    },

    selectionInfo () {
      return SelectionInfo.find(this.workId);
    }
  },
  methods: {
    async loadContents () {
      if (!this.isLoading &&
          this.editions.length > 0 && this.tocEntries.length > 0
      ) {
        let editionParams = this.editions.map((edition) => 'editions[]=' + edition.id);
        let tocParams = this.tocEntries.map((tocEntry) => 'toc_entries[]=' + tocEntry.id);

        let paramString = editionParams.join('&') + '&' + tocParams.join('&');

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

    deselectTocEntry (tocEntry) {
      this.selectionInfo.deselectTocEntry(tocEntry.id);
    },

    previousTocEntry (tocEntry) {
      let previousEntry = tocEntry.getPrevious();
      if (previousEntry) {
        this.selectionInfo.replaceTocEntry(previousEntry.id);
      }
    },

    nextTocEntry (tocEntry) {
      let nextEntry = tocEntry.getNext();
      if (nextEntry) {
        this.selectionInfo.replaceTocEntry(nextEntry.id);
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

.mobile-controls {
  float: left;
  position: relative;
  top: 6px;
  margin-right: 0.75em;
  margin-bottom: 0.5em;
  border-radius: 3px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid rgb(222, 226, 230);

  a {
    margin-top: 0.2em;
  }
}
</style>

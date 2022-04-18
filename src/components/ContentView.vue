<template>
  <div>
    <div class="work" v-if="work && tocEntry && edition">
      <b-collapse :id="'collapseWorkEditions' + work.id" class="top-toc">
        <b-card-text>
          <a v-b-toggle="'collapseWorkEditions' + work.id" style="position: absolute; right: 0.7em; top: 0.7em; size:1.2em; color: darkgrey">
            <font-awesome-icon icon="times-circle"/>
          </a>
          <div>Table of Contents</div>
          <div v-if="work.tocEntries.length < 100">
            <div v-for="(tocGroup, index) in tocGroups(work.tocEntries)" :key="index">
              <a v-for="tocEntry in tocGroup" :key="tocEntry.id" @click="navigateToTocEntry(tocEntry)" class="toc-link" :class="{ 'selected': isTocEntrySelected(tocEntry) }">{{ tocEntry.label }}</a>
            </div>
          </div>
          <div v-else class="mb-4">
            <b-tabs pills>
              <b-tab v-for="(tocGroup, index) in tocGroups(work.tocEntries)" :key="index" :title="index">
                <div class="mt-2">
                  <a v-for="tocEntry in tocGroup" :key="tocEntry.id" @click="navigateToTocEntry(tocEntry)" class="toc-link" :class="{ 'selected': isTocEntrySelected(tocEntry) }">{{ tocEntry.label }}</a>
                </div>
              </b-tab>
            </b-tabs>
          </div>
        </b-card-text>

        <span>Translation by: </span>
        <b-dropdown right :text="edition.authorsFormatted" size="sm" variant="outline-secondary">
          <b-dropdown-item @click="selectEdition(edition)" v-for="edition in sortedEditions" :key="edition.id">
            {{ edition.authorsFormatted }} ({{ edition.year }})
          </b-dropdown-item>
        </b-dropdown>
      </b-collapse>
    </div>


    <table class="table" v-if="work && tocEntry">
      <tr>
        <td class="translation-section">
          <div class="translation-content">
            <p v-if="getContentItem(tocEntry, edition) && getContentItem(tocEntry, edition).title > ''">
              <strong>{{ getContentItem(tocEntry, edition).title }}</strong>
            </p>
            <div class="mobile-controls d-lg-none bg-light">
              <span><strong>{{ tocEntry.label }}</strong></span>
              <a @click="previousTocEntry()" v-if="tocEntry.hasPrevious()" class="btn btn-outline-secondary btn-sm hover-button">
                <font-awesome-icon icon="arrow-alt-circle-up"/>
              </a>
              <a @click="nextTocEntry()" v-if="tocEntry.hasNext()" class="btn btn-outline-secondary btn-sm hover-button">
                <font-awesome-icon icon="arrow-alt-circle-down"/>
              </a>
              <a v-b-toggle="'collapseWorkEditions' + work.id" class="btn btn-outline-secondary btn-sm hover-button">
                <font-awesome-icon icon="list"/>
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
import Work from "@/store/models/Work";
import Content from "@/store/models/Content";
import TocEntry from "@/store/models/TocEntry";
import SelectionInfo from "@/store/models/SelectionInfo";
import WorkService from "@/services/WorkService";
import SelectionInfoService from "@/services/SelectionInfoService";
import {mapMutations} from "vuex";
import Edition from "@/store/models/Edition";
import ContentService from "@/services/ContentService";

export default {
  props: {
    workSlug: String,
    tocSlug: String
  },
  components: {},
  data () {
    return {
      isLoading: false,
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
      return Work.query().where('url_slug', this.workSlug).with(['editions.authors', 'tocEntries.work.tocEntries', 'authors']).first();
    },

    edition () {
      let edition = (this.selectionInfo && this.selectionInfo.editions.length > 0) ? Edition.query().whereId(this.selectionInfo.editions[0]).with(['authors']).first() : null;
      return edition ? edition : (this.work ? this.work.editions[0] : null);
    },

    tocEntry () {
      let tocSlug = this.tocSlug ? this.tocSlug : (this.work && this.work.tocEntries.length > 0 ? this.work.tocEntries[0].label : null);
      return TocEntry.query().where('work_id', this.work.id).where('label', tocSlug).with(['work.tocEntries']).first();
    },

    selectionInfo () {
      //return SelectionInfo.find(this.work.id);
      return SelectionInfoService.getSelectionInfo(this.work.id);
    },

    sortedEditions () {
      let editionsIds = this.work.editions.map((edition) => edition.id)
      return Edition.query().whereIdIn(editionsIds).orderBy('year').with('authors').all();
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
        this.isLoading = true;
        await ContentService.loadContent([this.tocEntry, this.tocEntry.getNext(), this.tocEntry.getPrevious()], [this.edition]);
        this.isLoading = false;
      }
    },

    getContentItem (tocEntry, edition) {
      return Content.query()
          .where('toc_entry_id', tocEntry.id)
          .where('edition_id', edition.id)
          .first();
    },

    getContent (tocEntry, edition) {
      let contentItem = this.getContentItem(tocEntry, edition);

      if (!contentItem) {
        this.loadContents();
        return '...';
      } else {
        return contentItem.content;
      }
    },

    navigateToTocEntry (tocEntry) {
      if (tocEntry) {
        this.$router.push({
          name: 'contentByToc', params: {
            author: this.work.authors[0].url_slug,
            workSlug: this.work.url_slug,
            tocSlug: tocEntry.label
          }
        });
      }
    },

    previousTocEntry () {
      let previousEntry = this.tocEntry ? this.tocEntry.getPrevious() : null;
      this.navigateToTocEntry(previousEntry);
    },

    nextTocEntry () {
      let nextEntry = this.tocEntry ? this.tocEntry.getNext() : null;
      this.navigateToTocEntry(nextEntry);
    },

    isTocEntrySelected (tocEntry) {
      return this.tocEntry.id === tocEntry.id;
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
    },

    tocGroups (tocEntries) {
      let groups = {};

      tocEntries.forEach(function (tocEntry) {
        let labelParts = tocEntry.label.split('.')

        let chapter = labelParts.length > 1 ? labelParts[0] : '0';
        if (!(chapter in groups)) {
          groups[chapter] = [];
        }
        groups[chapter].push(tocEntry);
      });

      return groups;
    },

    selectEdition (edition) {
      setTimeout(function () {
        this.selectionInfo.editions[0] = edition.id;

        SelectionInfo.update({
          where: this.work.id,
          data: {
            editions: this.selectionInfo.editions
          }
        })
      }.bind(this), 1);
    },
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

a.toc-link {
  display: inline-block;
  margin-left: 0.5em;
  text-decoration: underline;
  color: #222;

  &.selected {
    font-weight: bold;
  }
}

.edition-collapser {
  padding: 3px 6px;
  border: 1px solid transparent;
  border-radius: 3px;
  display: flex;
  justify-content: space-between;

  svg {
    position: relative;
    top: 4px;
    right: 2px;
  }

  &.collapsed {
    border-color: lightgray;

    .fa-angle-up {
      display: none;
    }
  }

  &.not-collapsed {
    .fa-angle-down {
      display: none;
    }
  }
}

.top-toc {
  padding: 0.7em 0;
}

</style>

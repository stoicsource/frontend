<template>
  <div>
    <div class="work" v-if="work && tocEntry && edition">
      <div class="container">
        <div class="row">
          <div class="col-12 col-lg-3">
            <b-collapse :id="'collapseWorkEditions' + work.id" class="top-toc" :visible="!isMobile()">
              <b-card-text>
                <a v-b-toggle="'collapseWorkEditions' + work.id" class="toc-toggler d-lg-none">
                  <font-awesome-icon icon="times-circle" size="lg"/>
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
          <div class="col-12 col-lg-9">
            <div class="translation-content" v-if="work && tocEntry">
              <p v-if="getContentItem(tocEntry, edition) && getContentItem(tocEntry, edition).title > ''">
                <strong>{{ getContentItem(tocEntry, edition).title }}</strong>
              </p>
              <div class="mobile-controls bg-light">
                <span><strong>{{ tocEntry.label }}</strong></span>
                <a @click="previousTocEntry()" v-if="tocEntry.hasPrevious()" class="btn btn-outline-secondary btn-sm hover-button">
                  <font-awesome-icon icon="arrow-alt-circle-up"/>
                </a>
                <a @click="nextTocEntry()" v-if="tocEntry.hasNext()" class="btn btn-outline-secondary btn-sm hover-button">
                  <font-awesome-icon icon="arrow-alt-circle-down"/>
                </a>
                <a v-b-toggle="'collapseWorkEditions' + work.id" class="d-lg-none btn btn-outline-secondary btn-sm hover-button">
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
            </div>
          </div>
        </div>
      </div>

    </div>
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
          this.fetchWorkDetails()
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
      let latestEdition = this.sortedEditions.length > 0 ? this.sortedEditions[this.sortedEditions.length - 1] : null;
      return edition ? edition : latestEdition;
    },

    tocEntry () {
      // order: 1. url, 2. selection, 3. first chapter
      let tocSlugEntry = this.tocSlug ? TocEntry.query().where('work_id', this.work.id).where('label', this.tocSlug).first() : null;
      let tocEntryId = tocSlugEntry ? tocSlugEntry.id : null;

      if (!tocEntryId) {
        tocEntryId = (this.selectionInfo && this.selectionInfo.tocEntries.length > 0) ? this.selectionInfo.tocEntries[0] : null;
      }

      if (!tocEntryId) {
        tocEntryId = (this.work && this.work.tocEntries.length > 0) ? this.work.tocEntries[0].id : null;
      }

      return tocEntryId ? TocEntry.query().whereId(tocEntryId).with(['work.tocEntries']).first() : null;
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

    fetchWorkDetails () {
      let work = Work.query().where('url_slug', this.$route.params.workSlug).with('authors').first()

      if (!work) {
        setTimeout(() => {
          this.fetchWorkDetails();
        }, 200);
        return;
      }

      WorkService.loadFullWork(work);
      this.setActiveWork(work);
      document.title = work ? (work.name + ' - ' + work.authorsFormatted) : 'Stoic Source';
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
        this.selectionInfo.replaceTocEntry(tocEntry.id);
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

    isMobile () {
      return window.screen.width <= 768;
    }
  }
}
</script>

<style lang="scss" scoped>

.work {
  padding-top: 0.7em;
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
  border-bottom: 1px solid darkgrey;
  margin-bottom: 1.2em;
}

.toc-toggler {
  position: absolute;
  right: 0.7em;
  top: 0.1em;
  size:1.2em;
  color: darkgrey
}

</style>

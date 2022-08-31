<template>
  <div>
    <div class="work">
      <div class="container">
        <div class="row" v-if="work && tocEntry && edition">
          <div class="col-12 col-lg-3">
            <div class="collapse top-toc" id="collapseWorkEditions" :class="{ 'show': !isMobile() }"
                 style="position: relative">
              <a class="toc-toggler d-lg-none" data-bs-toggle="collapse" href="#collapseWorkEditions" role="button">
                <i class="fa-solid fa-xmark fa-2xl"></i>
              </a>
              <table-of-contents
                  :editions="sortedEditions"
                  :toc-entries="sortedTocEntries"
                  :selected-edition="edition"
                  :selected-toc-entry="tocEntry"
                  @toc-entry-selected="navigateToTocEntry"
                  @edition-selected="selectEdition"
                  @edition-info-clicked="editionInfo"
              ></table-of-contents>
            </div>
          </div>
          <div class="col-12 col-lg-9">
            <div v-if="isLoading" class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <div v-else>
              <content-navigator
                  :work="work"
                  :edition="edition"
                  :toc-entry="tocEntry"
                  @on-navigate="navigateToTocEntry"
                  @edition-selected="selectEdition"
              ></content-navigator>
            </div>
          </div>
        </div>
        <div v-else>
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Work from "@/store/models/Work";
import TocEntry from "@/store/models/TocEntry";
import SelectionInfo from "@/store/models/SelectionInfo";
import WorkService from "@/services/WorkService";
import SelectionInfoService from "@/services/SelectionInfoService";
import {mapMutations} from "vuex";
import Edition from "@/store/models/Edition";
import ContentNavigator from "../components/content/ContentNavigator";
import ContentService from "../services/ContentService";
import TableOfContents from "../components/content/TableOfContents";

export default {
  props: {
    workSlug: String,
    tocSlug: String
  },
  components: {
    TableOfContents,
    ContentNavigator
  },
  data() {
    return {
      isLoading: false
    }
  },
  created() {
    this.$watch(
        () => this.$route.params,
        () => {
          this.onRouteChange()
        },
        {immediate: true}
    )
  },
  computed: {
    work() {
      return Work.query().where('urlSlug', this.workSlug).with(['editions.author', 'tocEntries.work.tocEntries', 'author']).first();
    },

    edition() {
      let edition = (this.selectionInfo && this.selectionInfo.editions.length > 0) ? Edition.query().whereId(this.selectionInfo.editions[0]).with(['author']).first() : null;
      let latestEdition = this.sortedEditions?.length > 0 ? this.sortedEditions[this.sortedEditions.length - 1] : null;
      return edition ? edition : latestEdition;
    },

    tocEntry() {
      // order: 1. url, 2. selection, 3. first chapter
      let tocSlugEntry = this.tocSlug ? TocEntry.query().where('work_id', this.work?.id).where('label', this.tocSlug).first() : null;
      let tocEntryId = tocSlugEntry ? tocSlugEntry.id : null;

      if (!tocEntryId) {
        tocEntryId = (this.selectionInfo && this.selectionInfo.tocEntries.length > 0) ? this.selectionInfo.tocEntries[0] : null;
      }

      if (!tocEntryId) {
        tocEntryId = this.work?.firstTocEntry?.id;
      }

      return tocEntryId ? TocEntry.query().whereId(tocEntryId).with(['work.tocEntries']).first() : null;
    },

    selectionInfo() {
      return SelectionInfoService.getSelectionInfo(this.work?.id);
    },

    sortedEditions() {
      let editionsIds = this.work ? this.work.editions.map((edition) => edition.id) : null;
      return editionsIds ? Edition.query().whereIdIn(editionsIds).where('quality', (value) => value >= 6).orderBy('year').with('author').all() : null;
    },

    sortedTocEntries() {
      return TocEntry.query().whereIdIn(this.work.tocEntries.map((tocEntry) => tocEntry.id)).orderBy('sort_order').withAllRecursive().all();
    }
  },
  methods: {
    ...mapMutations('app', ['setActiveWork']),

    onRouteChange() {
      let work = Work.query().where('urlSlug', this.$route.params.workSlug).with('author').first()

      WorkService.loadFullWork(work).then(function () {
        this.requireContent();
      }.bind(this));
      this.setActiveWork(work);
      document.title = work ? (work.name + ' - ' + work.authorsFormatted) : 'Stoic Source';
    },

    requireContent() {
      if (this.tocEntry && this.edition && !this.isLoading) {
        this.isLoading = !ContentService.isContentItemLoaded(this.tocEntry, this.edition);
        ContentService.requireContent(this.tocEntry, this.edition)
            .finally(function () {
              this.isLoading = false;
            }.bind(this));
      }
    },

    navigateToTocEntry(tocEntry) {
      if (tocEntry) {
        this.selectionInfo.replaceTocEntry(tocEntry.id);
        SelectionInfoService.saveToLocalStorage();
        this.$router.push({
          name: 'contentByToc', params: {
            author: this.work.author.urlSlug,
            workSlug: this.work.urlSlug,
            tocSlug: tocEntry.label
          }
        });
      }
    },

    selectEdition(edition) {
      setTimeout(function () {
        this.selectionInfo.editions[0] = edition.id;

        SelectionInfo.update({
          where: this.work.id,
          data: {
            editions: this.selectionInfo.editions
          }
        })

        this.requireContent();
        SelectionInfoService.saveToLocalStorage();
      }.bind(this), 1);
    },

    editionInfo() {
      this.$router.push({
        name: 'editionInfo', params: {
          editionId: this.edition.id
        }
      });
    },

    isMobile() {
      return window.screen.width <= 768;
    }
  }
}
</script>

<style lang="scss" scoped>

.work {
  padding-top: 0.7em;
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
  size: 1.2em;
  color: darkgrey
}
</style>

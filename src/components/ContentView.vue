<template>
  <div>
    <div class="work">
      <div class="container">
        <div class="row" v-if="work && tocEntry && edition">
          <div class="col-12 col-lg-3">
            <div class="collapse top-toc" id="collapseWorkEditions" :class="{ 'show': !isMobile() }" style="position: relative">
              <div class="card-text">
                <a class="toc-toggler d-lg-none" data-bs-toggle="collapse" href="#collapseWorkEditions" role="button">
                  <font-awesome-icon icon="times-circle" size="lg"/>
                </a>
                <div>Table of Contents</div>
                <div v-if="work.tocEntries.length < 125">
                  <div v-for="(tocGroup, index) in tocGroups(work.tocEntries)" :key="index">
                    <a v-for="tocEntry in tocGroup" :key="tocEntry.id" @click="navigateToTocEntry(tocEntry)" class="toc-link" :class="{ 'selected': isTocEntrySelected(tocEntry) }">{{ tocEntry.label }}</a>
                  </div>
                </div>
                <div v-else class="mb-4">
                  <ul data-v-6c06a484="" id="myTab2" class="nav nav-tabs nav-fill">
                    <li v-for="(tocGroup, index) in tocGroups(work.tocEntries)" :key="index" class="nav-item">
                      <a :href="'#pane' + index" data-bs-toggle="tab" class="nav-link" :class="{ 'active': isSelectedTocEntryInGroup(index) }">{{ index }}</a>
                    </li>
                  </ul>

                  <div class="tab-content" style="margin-left: -0.5em;">
                    <div v-for="(tocGroup, index) in tocGroups(work.tocEntries)" :key="index" class="tab-pane fade show" :id="'pane' + index" :class="{ 'active': isSelectedTocEntryInGroup(index) }">
                      <div class="mt-2">
                        <a v-for="tocEntry in tocGroup" :key="tocEntry.id" @click="navigateToTocEntry(tocEntry)" class="toc-link" :class="{ 'selected': isTocEntrySelected(tocEntry) }">{{ tocEntry.label }}</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <span>Translation by: </span>
              <div class="dropdown" style="display: inline-block;">
                <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                  {{ edition.authorsFormatted }}
                </button>
                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                  <li v-for="edition in sortedEditions" :key="edition.id">
                    <a @click="selectEdition(edition)" class="dropdown-item" href="#">{{ edition.authorsFormatted }} ({{ edition.year }})</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div class="col-12 col-lg-9">
            <div class="translation-content" v-if="work && tocEntry">
              <div class="content-navigation bg-light">
                <span><strong>{{ tocEntry.label }}</strong></span>
                <a @click="previousTocEntry()" v-if="tocEntry.hasPrevious()" class="btn btn-outline-secondary btn-sm"><font-awesome-icon icon="arrow-alt-circle-up"/></a>
                <a @click="nextTocEntry()" v-if="tocEntry.hasNext()" class="btn btn-outline-secondary btn-sm"><font-awesome-icon icon="arrow-alt-circle-down"/></a>
                <a class="d-lg-none btn btn-outline-secondary btn-sm" data-bs-toggle="collapse" href="#collapseWorkEditions" role="button"><font-awesome-icon icon="list"/></a>
                <a @click="randomTocEntry()" class="d-lg-none btn btn-outline-secondary btn-sm"><font-awesome-icon icon="random"/></a>
                <a class="d-none btn btn-outline-secondary btn-sm"><font-awesome-icon icon="info-circle"/></a>
                <a v-if="canShare()" @click="shareEntry" class="btn btn-outline-secondary btn-sm"><font-awesome-icon icon="share-alt"/></a>
              </div>

              <h1 v-if="getContentItem(tocEntry, edition) && getContentItem(tocEntry, edition).title">{{ getContentItem(tocEntry, edition).title }}</h1>

              <div v-if="getContentItem(tocEntry, edition) && getContentItem(tocEntry, edition).contentType === 'text'">
                <p v-for="paragraph in getContent(tocEntry, edition).split('\n')" :key="paragraph.substring(0, 12)">{{ paragraph }}</p>
              </div>
              <div v-else v-html="getContent(tocEntry, edition)">
              </div>

              <div v-if="getContentItem(tocEntry, edition) && getContentItem(tocEntry, edition).notes > ''" class="translator-notes">
                Translator notes: <br>
                <div v-if="getContentItem(tocEntry, edition).contentType === 'text'">
                  {{ getContentItem(tocEntry, edition).notes }}
                </div>
                <div v-else v-html="getContentItem(tocEntry, edition).notes"></div>
              </div>

              <div v-if="isLoading" class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
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
      contentLoadingFailed: false
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

    loadContents () {
      if (!this.isLoading &&
          this.edition && this.tocEntry
      ) {
        this.isLoading = true;
        ContentService.loadContent([this.tocEntry, this.tocEntry.getNext(), this.tocEntry.getPrevious()], [this.edition])
            .then(function () {
              this.isLoading = false;
            }.bind(this))
            .catch(function () {
              this.contentLoadingFailed = true;
              this.isLoading = false;
            }.bind(this));
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
        if (!this.contentLoadingFailed) {
          this.loadContents();
        }
        return '...';
      } else {
        return contentItem.content;
      }
    },

    navigateToTocEntry (tocEntry) {
      if (tocEntry) {
        this.contentLoadingFailed = false;
        this.selectionInfo.replaceTocEntry(tocEntry.id);
        SelectionInfoService.saveToLocalStorage();
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

    randomTocEntry () {
      let nextEntry = this.tocEntry;
      while (this.work.tocEntries.length > 1 && nextEntry.id === this.tocEntry.id) {
        let entryIndex = Math.floor(Math.random() * this.work.tocEntries.length);
        nextEntry = this.work.tocEntries[entryIndex];
      }
      this.navigateToTocEntry(nextEntry);
    },

    isTocEntrySelected (tocEntry) {
      return this.tocEntry.id === tocEntry.id;
    },

    isSelectedTocEntryInGroup (groupIndex) {
      let label = this.tocEntry ? this.tocEntry.label : '';
      let preDot = label.split('.')[0];
      return preDot === groupIndex;
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

        SelectionInfoService.saveToLocalStorage();
      }.bind(this), 1);
    },

    isMobile () {
      return window.screen.width <= 768;
    },

    canShare () {
      return navigator.share;
    },

    shareEntry () {
      if (navigator.share) {
        navigator.share({
          title: this.work.authorsFormatted + ' - ' + this.work.name + ' ' + this.tocEntry.label,
          url: window.location
        }).then(() => {
          console.log('Thanks for sharing!');
        })
            .catch(console.error);
      }
    }
  }
}
</script>

<style scoped>
.translation-content >>> blockquote {
  border-left: 3px solid #eaecf0;
  padding: 8px 22px;
}
</style>

<style lang="scss" scoped>

h1 {
  font-size: 1.3em;
}

.work {
  padding-top: 0.7em;
}

.btn {
  display: block;
}

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

.content-navigation {
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
  font-size: 1.1em;

  &.selected {
    font-weight: bold;
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
  size: 1.2em;
  color: darkgrey
}

</style>

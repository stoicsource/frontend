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
                  <div v-for="(tocGroup, index) in tocGroups(sortedTocEntries)" :key="index">
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

              <div class="d-flex flex-row flex-wrap mt-3">
                <div class="me-2" >Translation&nbsp;by: </div>
                <div class="dropdown">
                  <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button"
                          id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                    {{ edition.authorsFormatted }}
                  </button>
                  <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                    <li v-for="edition in sortedEditions" :key="edition.id">
                      <a @click="selectEdition(edition)" class="dropdown-item" href="#">{{ edition.authorsFormatted }}
                        ({{ edition.year }})</a>
                    </li>
                  </ul>
                </div>
                <a @click="editionInfo()" class="btn btn-outline-secondary btn-sm ms-2"><font-awesome-icon icon="info-circle"/></a>
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
                <a v-if="canShare()" @click="shareEntry" class="btn btn-outline-secondary btn-sm"><font-awesome-icon icon="share-alt"/></a>
              </div>

              <div v-if="isLoading" class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <div v-else>
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
  data () {
    return {
      isLoading: false
    }
  },
  created () {
    this.$watch(
        () => this.$route.params,
        () => {
          this.onRouteChange()
        },
        {immediate: true}
    )
  },
  computed: {
    work () {
      return Work.query().where('urlSlug', this.workSlug).with(['editions.author', 'tocEntries.work.tocEntries', 'author']).first();
    },

    edition () {
      let edition = (this.selectionInfo && this.selectionInfo.editions.length > 0) ? Edition.query().whereId(this.selectionInfo.editions[0]).with(['author']).first() : null;
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
      return Edition.query().whereIdIn(editionsIds).where('quality', (value) => value >= 6). orderBy('year').with('author').all();
    },

    sortedTocEntries () {
      return TocEntry.query().whereIdIn(this.work.tocEntries.map((tocEntry) => tocEntry.id)).orderBy('sort_order').withAllRecursive().all();
    }
  },
  methods: {
    ...mapMutations('app', ['setActiveWork']),

    onRouteChange () {
      let work = Work.query().where('urlSlug', this.$route.params.workSlug).with('author').first()

      if (!work) {
        setTimeout(() => {
          this.onRouteChange();
        }, 200);
        return;
      }

      WorkService.loadFullWork(work).then(function () {
        this.requireContent();
      }.bind(this));
      this.setActiveWork(work);
      document.title = work ? (work.name + ' - ' + work.authorsFormatted) : 'Stoic Source';
    },

    requireContent () {
      if (!this.isLoading) {
        this.isLoading = !ContentService.isContentItemLoaded(this.tocEntry, this.edition);
        ContentService.requireContent(this.tocEntry, this.edition)
            .then(function () {
              this.isLoading = false;
            }.bind(this))
            .catch(function () {
              this.isLoading = false;
            }.bind(this));
      }
    },

    getContentItem (tocEntry, edition) {
      return ContentService.getContentItem(tocEntry, edition);
    },

    getContent (tocEntry, edition) {
      let contentItem = this.getContentItem(tocEntry, edition);

      if (!contentItem) {
        return '...';
      } else {
        return contentItem.content;
      }
    },

    navigateToTocEntry (tocEntry) {
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

        this.requireContent();
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
    },

    editionInfo () {
      this.$router.push({
        name: 'editionInfo', params: {
          editionId: this.edition.id
        }
      });
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

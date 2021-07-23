<template>
  <b-overlay :show="loading">
    <div class="container-fluid">
      <div class="row">
        <div class="d-md-none bg-light" id="selector-mobile">
          <div v-b-toggle="'mobileWorkSelection'" class="selection-overview">
            <div class="work-name">{{ selectedWork ? selectedWork.name : 'Loading Data' }}</div>
            <font-awesome-icon icon="angle-down"/>
            <font-awesome-icon icon="angle-up"/>
          </div>
          <b-collapse id="mobileWorkSelection">
            <work-list></work-list>
          </b-collapse>
        </div>

        <div class="col-12 col-md-3 sticky-sidebar d-none d-md-block">
          <work-list v-on:update-selected-work="onWorkSelected"></work-list>

          <div class="d-none d-lg-block mt-2 text-muted">
            Feedback? Questions? <span @click="showAbout" class="link-style">Mail us</span>
          </div>
        </div>

        <div class="col-12 col-md-9">
          <content-view :edition-ids="selectedEditionIds" :toc-entry-ids="selectedTocEntryIds"></content-view>
        </div>
      </div>

      <b-modal id="about-modal" title="About" cancel-disabled>
        <p class="text-center">
          Developed by Patrick Menke<br>
          <a href="mailto:feedback@stoicsource.com">contact</a>
        </p>
        <p class="text-center">
          Material assembled by George O'Ryan<br>
          <a href="https://www.reddit.com/user/Sudden-Sand8907" target="_blank">reddit</a> | <a href="mailto:oryang7@gmail.com">contact</a>
        </p>
        <template #modal-footer="{ ok }">
          <b-button size="sm" @click="ok()">
            Close
          </b-button>
        </template>
      </b-modal>

      <footer class="d-lg-none text-center text-muted">
        Feedback? Questions? <span @click="showAbout" class="link-style">Mail us</span>
      </footer>
    </div>
  </b-overlay>
</template>

<script>
import Clipboard from 'clipboard'
import Work from '@/store/models/Work'
import WorkList from "@/components/WorkList";
import ContentView from "@/components/ContentView";
import TocEntry from "@/store/models/TocEntry";
import Edition from "@/store/models/Edition";
import WorkService from "@/services/WorkService";
import {mapMutations, mapState} from "vuex";
import SelectionInfo from "@/store/models/SelectionInfo";

export default {
  name: 'App',
  components: {WorkList, ContentView},
  data () {
    return {
      loading: false
    }
  },
  mounted () {
    this.loading = true;
    new Clipboard('#copy-button');

    Work.api().get(process.env.VUE_APP_API_URL + '/works')
        .then(function () {
          this.readLocalStorage();
          this.applyUrlParams();
        }.bind(this))
        .catch(function (error) {
          alert(error.message);
        })
        .then(function () {
          this.loading = false;
        }.bind(this));


  },
  methods: {
    ...mapMutations('app', ['setActiveWork']),

    writeLocalStorage () {
      //localStorage.selectedWorkId = JSON.stringify(this.selectedTranslations);

    },
    readLocalStorage () {
      // if (localStorage.selectedWorkId) {
      //   // this.selectedTranslations = JSON.parse(localStorage.selectedTranslations);
      //   let workToSelect = Work.query().where('id', Number(localStorage.selectedWorkId)).with('tocEntries').first();
      //   if (workToSelect) {
      //     workToSelect.select();
      //     WorkService.workSelectDefaults(workToSelect);
      //   }
      // } else {
      //   let meditations = Work.query().where('name', 'The Meditations').with('tocEntries').first();
      //   if (meditations) {
      //     meditations.select();
      //     WorkService.workSelectDefaults(meditations);
      //   }
      // }

    },
    applyUrlParams () {
      if (this.$route.params.work) {
        let matchingWork = Work.query().where('url_slug', this.$route.params.work).first();
        if (matchingWork) {
          matchingWork.select();
          // this.$root.$emit('bv::toggle::collapse', 'collapseWork' + matchingWork.id); // might be more elegant to do this via v-model
        }
      }
      if (this.$route.params.toc && this.selectedWork) {
        let tocLabels = this.$route.params.toc.split(',');

        tocLabels.forEach((tocLabel) => {
          let tocEntry = TocEntry.query().where('label', tocLabel).first();

          if (tocEntry) {
            TocEntry.update({
              where: tocEntry.id,
              data: {
                selected: true
              }
            });
          }
        });
      }
      if (this.$route.params.translator) {
        let author_slugs = this.$route.params.translator.split(',');

        author_slugs.forEach((slug) => {
          this.selectedWork.editions.forEach((edition) => {
            if (edition.authors.some(editionAuthor => editionAuthor.url_slug === slug)) {
              Edition.update({
                where: edition.id,
                data: {
                  selected: true
                }
              });
            }
          });
        });
      }
    },
    showAbout () {
      this.$bvModal.show('about-modal');
    },
    onWorkSelected (work) {
      if (!this.activeWork || work.id !== this.activeWork.id) {
        this.setActiveWork(work);
        WorkService.workSelectDefaults(work);
        localStorage.selectedWorkId = JSON.stringify(this.selectedWork.id);
      }
    }
  },
  computed: {
    ...mapState('app', ['activeWork']),

    selectedWork () {
      return this.activeWork;
    },

    selectedEditionIds () {
      if (this.selectedWork) {
        let selectionInfo = SelectionInfo.find(this.selectedWork.id);
        return selectionInfo.editions;
      }
      return [];
    },

    selectedTocEntryIds () {
      if (this.selectedWork) {
        let selectionInfo = SelectionInfo.find(this.selectedWork.id);
        return selectionInfo.tocEntries;
      }
      return [];
    }
  },
  watch: {
    $route () {
      this.applyUrlParams();
    }
  }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

td, th {
  text-align: left;
  vertical-align: top;
  padding-bottom: 1em;
}

.book-chapters {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;

  .book-chapter {
    margin-right: 1em;
  }
}

.hint-text {
  font-size: 0.8em;
  color: #555;
}

.subtle-switch {
  .custom-control-input:checked ~ .custom-control-label::before {
    color: #444;
    border-color: lightgray;
    background-color: lightgray;
  }
}

.text-muted {
  a, .link-style {
    color: #6c757d;
    text-decoration: underline;
  }
}

.col-12.sticky-sidebar {
  position: sticky;
  height: 100vh;
  top: 0;
  overflow-y: scroll;
}

#selector-mobile {
  width: 100vw;

  .selection-overview {
    display: flex;
    justify-content: space-between;
    padding: 0.75em;

    &.collapsed {
      .fa-angle-up {
        display: none;
      }
    }

    &.not-collapsed {
      .fa-angle-down {
        display: none;
      }
    }

    .work-name {
      font-size: 1.2em;
    }

    svg {
      font-size: 1.4em;
      color: #444;
    }
  }

  #mobileWorkSelection {
    padding: 0 0.7em;
  }
}
</style>

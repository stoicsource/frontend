<template>
  <b-overlay :show="loading">
    <router-view></router-view>
    <div class="container-fluid">
      <div class="row">
        <div class="col-12 col-md-3 sticky-sidebar d-none d-md-block">
          <b-button variant="primary" @click="showWorkSelect">Select Work</b-button>

          <work-component v-if="selectedWork" :work-id="selectedWork.id"></work-component>

          <div class="d-none d-lg-block mt-2 text-muted">
            Feedback? Questions? <span @click="showAbout" class="link-style">Mail us</span>
          </div>
        </div>

        <div class="col-12 col-md-9">
          <content-view v-if="selectedWork" :work-id="selectedWork.id" :edition-ids="selectedEditionIds" :toc-entry-ids="selectedTocEntryIds"></content-view>
        </div>
      </div>

      <b-modal id="workselect-modal" title="Select Work" ok-disabled>
        <work-select v-on:work-selected="onWorkSelected"></work-select>
      </b-modal>

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
import ContentView from "@/components/ContentView";
import WorkService from "@/services/WorkService";
import {mapMutations, mapState} from "vuex";
import SelectionInfo from "@/store/models/SelectionInfo";
import TocEntry from "@/store/models/TocEntry";
import Edition from "@/store/models/Edition";
import WorkSelect from "@/components/WorkSelect";
import WorkComponent from "@/components/Work";

export default {
  name: 'App',
  components: {WorkSelect, ContentView, WorkComponent},
  data () {
    return {
      loading: false,
      mobileLoadingStatus: 'Loading Data'
    }
  },
  mounted () {
    this.loading = true;
    this.mobileLoadingStatus = 'Initiating...';
    new Clipboard('#copy-button');
    this.mobileLoadingStatus = 'Fetching Data...';

    Work.api().get(process.env.VUE_APP_API_URL + '/works')
        .then(function () {
          this.mobileLoadingStatus = 'Processing Data...';
          this.readLocalStorage();
          this.applyUrlParams();
          this.mobileLoadingStatus = 'Setting up...';
          if (!this.selectedWork) {
            this.showWorkSelect();
          }
        }.bind(this))
        .catch(function (error) {
          console.log(error);
          alert(error.message);
        })
        .then(function () {
          this.loading = false;
        }.bind(this));


  },
  methods: {
    ...mapMutations('app', ['setActiveWork']),

    writeSelectionInfoToLocalStorage () {
      if (!this.loading) {
        let allInfo = SelectionInfo.all();
        localStorage.selectionInfo = JSON.stringify(allInfo);
      }
    },
    readLocalStorage () {
      if (!this.$route.params.work) {
        let workToSelect = null;
        if (localStorage.selectedWorkId) {
          workToSelect = Work.query().where('id', Number(localStorage.selectedWorkId)).with('tocEntries').first();
        } else {
          workToSelect = Work.query().where('name', 'The Meditations').with('tocEntries').first();
        }

        this.setActiveWork(workToSelect);
        this.$root.$emit('bv::toggle::collapse', 'collapseWork' + workToSelect.id);
      }

      if (localStorage.selectionInfo) {
        SelectionInfo.create( { data: JSON.parse(localStorage.selectionInfo) })
      }
    },
    applyUrlParams () {
      if (this.$route.params.work) {
        let matchingWork = Work.query().where('url_slug', this.$route.params.work).first();
        if (matchingWork) {
          this.setActiveWork(matchingWork);
          this.$root.$emit('bv::toggle::collapse', 'collapseWork' + matchingWork.id);
        }
      }

      if (this.$route.params.toc && this.selectedWork) {
        let selectionInfo = SelectionInfo.find(this.selectedWork.id);
        if (!selectionInfo) {
          selectionInfo = new SelectionInfo();
          selectionInfo.workId = this.selectedWork.id;
        }

        selectionInfo.tocEntries = [];
        selectionInfo.deselectAllTocEntries();
        let tocLabels = this.$route.params.toc.split(',');
        tocLabels.forEach((tocLabel) => {
          let tocEntry = TocEntry.query().where('label', tocLabel).where('work_id', this.selectedWork.id).first();

          if (tocEntry) {
            selectionInfo.selectTocEntry(tocEntry.id);
          }
        });

        if (this.$route.params.translator) {
          let author_slugs = this.$route.params.translator.split(',');

          selectionInfo.editions = [];
          selectionInfo.deselectAllEditions();
          let editions = Edition.query().where('work_id', this.selectedWork.id).with('authors').all();
          author_slugs.forEach((slug) => {
            editions.forEach((edition) => {
              if (edition.authors.some(editionAuthor => editionAuthor.url_slug === slug)) {
                selectionInfo.selectEdition(edition.id);
              }
            });
          });
        }

        SelectionInfo.insert({ data: selectionInfo });
      }
    },
    showAbout () {
      this.$bvModal.show('about-modal');
    },
    showWorkSelect () {
      this.$bvModal.show('workselect-modal');
    },
    onWorkSelected (work) {
      if (!this.activeWork || work.id !== this.activeWork.id) {
        this.loading = true;
        Work.api().get(process.env.VUE_APP_API_URL + '/work/' + work.id)
            .then(function () {
              this.setActiveWork(work);
              WorkService.workSelectDefaults(work);
              localStorage.selectedWorkId = JSON.stringify(this.selectedWork.id);
            }.bind(this))
            .catch(function (error) {
              console.log(error);
              alert(error.message);
            })
            .then(function () {
              this.loading = false;
            }.bind(this));
      }
      this.$bvModal.hide('workselect-modal');
    }
  },
  computed: {
    ...mapState('app', ['activeWork']),

    selectedWork () {
      return this.activeWork;
    },

    selectedEditionIds () {
      if (this.selectedWork) {
        this.writeSelectionInfoToLocalStorage();
        let selectionInfo = SelectionInfo.find(this.selectedWork.id);
        return selectionInfo ? selectionInfo.editions: [];
      }
      return [];
    },

    selectedTocEntryIds () {
      if (this.selectedWork) {
        this.writeSelectionInfoToLocalStorage();
        let selectionInfo = SelectionInfo.find(this.selectedWork.id);
        return selectionInfo ? selectionInfo.tocEntries : [];
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

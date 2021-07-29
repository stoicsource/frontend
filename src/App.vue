<template>
  <b-overlay :show="loading">
    <router-view></router-view>
    <div class="container-fluid">
      <div class="row">
        <div class="col-12 col-md-3 sticky-sidebar">
          <b-button variant="primary" @click="showWorkSelect" class="w-100 mt-2 mb-2">Select Work</b-button>

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
      loading: false
    }
  },
  mounted () {
    this.loading = true;
    new Clipboard('#copy-button');

    Work.api().get(process.env.VUE_APP_API_URL + '/works')
        .then(function () {
          // this.determineInitialWorkSelection();
          // this.initSelection();
          // if (!this.selectedWork) {
          //   this.showWorkSelect();
          // }

          Promise.all([this.determineInitialWorkSelection(), this.initSelection()]).then(function () {
            if (!this.selectedWork) {
              this.showWorkSelect();
            }
          }.bind(this));
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
    determineInitialWorkSelection () {
      let promise = Promise.resolve();
      if (this.$route.params.work) {
        let matchingWork = Work.query().where('url_slug', this.$route.params.work).first();
        if (matchingWork) {
          promise = this.loadAndActivateWork(matchingWork);
        }
      } else {
        let workToSelect = null;
        if (localStorage.selectedWorkId) {
          workToSelect = Work.query().where('id', Number(localStorage.selectedWorkId)).with('tocEntries').first();
        } else {
          workToSelect = Work.query().where('name', 'The Meditations').with('tocEntries').first();
        }

        promise = this.loadAndActivateWork(workToSelect);
      }
      return promise;
    },
    initSelection () {
      let promise = Promise.resolve();
      if (localStorage.selectionInfo) {
        promise = SelectionInfo.create({data: JSON.parse(localStorage.selectionInfo)})
      }

      promise.then(function () {
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

          SelectionInfo.insert({data: selectionInfo});
        }
      }.bind(this));

      return promise;
    },
    showAbout () {
      this.$bvModal.show('about-modal');
    },
    showWorkSelect () {
      this.$bvModal.show('workselect-modal');
    },
    loadAndActivateWork (work) {
      this.loading = true;

      let hasEditions = Edition.query().where('work_id', work.id).exists();
      let hasToc = TocEntry.query().where('work_id', work.id).exists();
      let promise = Promise.resolve(true);
      if (!hasEditions || !hasToc) {
        promise = Work.api().get(process.env.VUE_APP_API_URL + '/work/' + work.id)
      }

      promise.then(function () {
        this.setActiveWork(work);
        let workWithRelations = Work.query().where('id', work.id).with(['tocEntries', 'editions']).first();
        WorkService.workSelectDefaults(workWithRelations);
        localStorage.selectedWorkId = JSON.stringify(this.selectedWork.id);
      }.bind(this))
          .catch(function (error) {
            console.log(error);
            alert(error.message);
          })
          .then(function () {
            this.loading = false;
          }.bind(this));

      return promise;
    },
    onWorkSelected (work) {
      if (!this.activeWork || work.id !== this.activeWork.id) {
        this.loadAndActivateWork(work);
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
        return selectionInfo ? selectionInfo.editions : [];
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
$primary-color: #0B54A1;

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

.text-muted {
  a, .link-style {
    color: #6c757d;
    text-decoration: underline;
  }
}

.col-12.sticky-sidebar {
  @media (min-width: 768px) {
    position: sticky;
    height: 100vh;
    top: 0;
    overflow-y: scroll;
  }
}

.btn.btn-primary {
  background-color: $primary-color;
  border-color: $primary-color;
}
</style>

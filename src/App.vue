<template>
  <b-overlay :show="loading">
    <div class="container-fluid">
      <div class="row">
        <div class="col-12 col-lg-3 sticky-sidebar">
          <work-list></work-list>

          <div class="d-none d-lg-block mt-2 text-muted">
            Feedback? Questions? <span @click="showAbout" class="link-style">Mail us</span>
          </div>
        </div>

        <div class="col-12 col-lg-9">
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
import {mapMutations, mapState} from "vuex";
import TocEntry from "@/store/models/TocEntry";
import Edition from "@/store/models/Edition";

export default {
  name: 'App',
  components: {WorkList, ContentView},
  data () {
    return {
      loading: false,
      saveSelection: true
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
    ...mapMutations('app', [
      'setSelectedWorkId'
    ]),

    writeLocalStorage () {
      localStorage.saveSelection = JSON.stringify(this.saveSelection);
      if (this.saveSelection) {
        localStorage.selectedTranslations = JSON.stringify(this.selectedTranslations);
        localStorage.selectedSections = JSON.stringify(this.selectedSections);
      } else {
        localStorage.removeItem('selectedTranslations');
        localStorage.removeItem('selectedSections');
      }
    },
    readLocalStorage () {
      if (localStorage.saveSelection) {
        this.saveSelection = JSON.parse(localStorage.saveSelection);
      }
      if (localStorage.selectedTranslations) {
        this.selectedTranslations = JSON.parse(localStorage.selectedTranslations);
      }
      if (localStorage.selectedSections) {
        this.selectedSections = JSON.parse(localStorage.selectedSections);
      }
    },
    applyUrlParams () {
      if (this.$route.params.work) {
        let matchingWork = Work.query().where('url_slug', this.$route.params.work).first();
        this.setSelectedWorkId(matchingWork ? matchingWork.id : null);
      }
      if (this.$route.params.toc && this.selectedWorkId) {
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
    }
  },
  computed: {
    selectedTranslationMeta () {
      return this.translationMeta.filter((meta) => this.selectedTranslations.some((translation) => translation.toLowerCase() === meta.key.toLowerCase()));
    },
    ...mapState('app', [
      'selectedWorkId'
    ]),

    selectedWork () {
      return Work.query().where('id', this.selectedWorkId).with(['editions.authors', 'tocEntries.work.tocEntries']).first();
    },

    selectedEditionIds () {
      return this.selectedWork ? this.selectedWork.editions.filter((edition) => edition.selected).map(edition => edition.id) : [];
    },

    selectedTocEntryIds () {
      return this.selectedWork ? this.selectedWork.tocEntries.filter((tocEntry) => tocEntry.selected).map(entry => entry.id) : [];
    }
  },
  watch: {
    selectedTranslations () {
      this.writeLocalStorage();
    },
    selectedSections () {
      this.writeLocalStorage();
    },
    saveSelection () {
      this.writeLocalStorage();
    },
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
</style>

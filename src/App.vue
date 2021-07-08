<template>
  <b-overlay :show="loading" rounded="sm">
    <div class="container-fluid">
      <div class="row">
        <div class="col-12 col-lg-3 sticky-sidebar">
          <work-list></work-list>

          <div class="d-none d-lg-block mt-2 text-muted">
            Feedback? Questions? <span @click="showAbout" class="link-style">Mail us</span>
          </div>
        </div>

        <div class="col-12 col-lg-9">
          <content-view :editions="selectedEditions" :toc-entries="selectedTocEntries"></content-view>
        </div>
      </div>

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
import {mapState} from "vuex";

export default {
  name: 'App',
  components: {WorkList, ContentView},
  data () {
    return {
      loading: false,
      quoteText: '',
      saveSelection: true
    }
  },
  mounted () {
    this.loading = true;
    new Clipboard('#copy-button');

    Work.api().get('https://127.0.0.1:8000/api/works')
        // .then(function (response) {
        //
        // })
        .catch(function (error) {
          alert(error.message);
        })
        .then(function () {
          this.loading = false;
        }.bind(this));


  },
  methods: {
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
      if (this.$route.params.chapter) {
        this.selectedSections = this.$route.params.chapter.split(',');
      }
      if (this.$route.params.translator) {
        this.selectedTranslations = this.$route.params.translator.split(',');
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

    selectedEditions () {
      return this.selectedWork ? this.selectedWork.editions.filter((edition) => edition.selected) : [];
    },

    selectedTocEntries () {
      return this.selectedWork ? this.selectedWork.tocEntries.filter((tocEntry) => tocEntry.selected) : [];
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

.translation-section {
  .translation-content {
    max-width: 35em;
    line-height: 1.6em;
  }

  .quote-translation {
    visibility: hidden;
    display: inline-block;
    margin-left: 0.5em;
    padding: 0 5px;
    color: gray;
    cursor: pointer;
    border: 1px solid lightgray;
    border-radius: 6px;
  }

  &:hover {
    .quote-translation {
      visibility: visible;
    }
  }
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

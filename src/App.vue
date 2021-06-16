<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12 col-lg-3">
        <div class="mt-2">Translations</div>
        <v-select multiple :options="translationMeta" v-model="selectedTranslations" :reduce="translation => translation.key"></v-select>

        <div class="mt-2 mt-lg-4">Chapters</div>
        <v-select multiple :options="sectionsFlat" v-model="selectedSections"></v-select>

        <div class="mt-2 mb-3">
          <b-form-checkbox v-model="saveSelection" switch class="subtle-switch">
            Remember Selection
          </b-form-checkbox>
        </div>

        <div class="accordion mt-2 d-none d-lg-block" role="tablist">
          <b-card no-body class="mb-1" v-for="book in sectionsTree" :key="book.key">
            <b-card-header header-tag="header" class="p-1" role="tab" v-b-toggle="'collapseBook' + book.key">
              Book {{ book.key }}
            </b-card-header>
            <b-collapse :id="'collapseBook' + book.key" accordion="my-accordion" role="tabpanel">
              <b-card-body>
                <b-card-text class="book-chapters">
                  <a v-for="chapter in book.sections" :key="book.key + '-' + chapter" class="book-chapter" @click="selectSection(book.key + '.' + chapter)">
                    {{ book.key }}.{{ chapter }}
                  </a>
                </b-card-text>
              </b-card-body>
            </b-collapse>
          </b-card>
        </div>
        <div class="hint-text d-none d-lg-inline-block">Select multiple chapters through the dropdown box, or an individual chapter through the list.</div>
        <div class="d-none d-lg-block mt-2 text-muted">
          Feedback? Questions? <span @click="showAbout" class="link-style">Mail us</span>
        </div>
      </div>

      <div class="col-12 col-lg-9">
        <div v-if="loading">loading...</div>
        <div v-if="translations">
          <table class="table">
            <tr>
              <th class="d-none d-lg-table-cell"></th>
              <th v-for="translationInfo in selectedTranslationMeta" :key="translationInfo.key">{{ translationInfo.author }}</th>
            </tr>
            <tr v-for="section in selectedSections" :key="section">
              <td class="d-none d-lg-table-cell">{{ section }}</td>
              <td v-for="(translationInfo, index) in selectedTranslationMeta" :key="translationInfo.key" class="translation-section">
                <div class="translation-content">
                  <span v-if="index === 0" class="d-lg-none"><strong>{{ section }}</strong></span>
                  {{ findSectionData(section)[translationInfo.key] }}
                  <span class="quote-translation" @click="quoteTranslation(section, translationInfo.key)">quote</span>
                </div>
              </td>
            </tr>
          </table>
        </div>
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
</template>

<script>
const axios = require('axios');
import Clipboard from 'clipboard'

export default {
  name: 'App',
  components: {},
  mounted () {
    this.loading = true;
    new Clipboard('#copy-button');
    axios.get(window.stoicsource.settings.apiUrl)
        .then(function (response) {
          this.translations = response.data;
          this.extractSections();
          this.selectRandomSection();
          this.readLocalStorage();
          this.applyUrlParams();
        }.bind(this))
        .catch(function (error) {
          console.log(error);
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
    selectRandomSection () {
      let sectionIndex = Math.floor(Math.random() * this.sectionsFlat.length - 1);
      this.selectedSections = [this.sectionsFlat[sectionIndex]];

      let keys = this.translationMeta.map(meta => meta.key);
      for (let i = 0; i < 3; i++) {
        let indexToSelect = Math.floor(Math.random() * keys.length)
        this.selectedTranslations.push(keys.splice(indexToSelect, 1)[0]);
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
    extractSections () {
      this.sectionsTree = [];
      this.sectionsFlat = [];
      this.translations.forEach((translation) => {
        this.sectionsFlat.push(translation.SectionNumber);

        let numberParts = translation.SectionNumber.split('.');
        let book = numberParts[0];
        let chapter = numberParts[1];

        let bookSection = this.sectionsTree.find((section) => section.key === book);
        if (!bookSection) {
          bookSection = {
            key: book,
            sections: []
          };
          this.sectionsTree.push(bookSection);
        }

        bookSection.sections.push(chapter);
      });
    },
    findSectionData (sectionNumber) {
      let matches = this.translations.filter((section) => section.SectionNumber === sectionNumber);
      return matches.length > 0 ? matches[0] : [];
    },
    selectSection (sectionNumber) {
      this.selectedSections = [sectionNumber];
    },
    quoteTranslation (section, key) {
      let quotedSection = this.findSectionData(section);
      let authorData = this.translationMeta.find(translation => translation.key === key);
      let link = 'https://www.stoicsource.com/meditations/' + quotedSection.SectionNumber + '/' + key;

      let markdown = '> ' + quotedSection[key] + "\n";
      let authorInfo = '*Marcus Aurelius, Meditations ' + quotedSection.SectionNumber + ' (Translation by ' + authorData.author + ')*';
      markdown += '[' + authorInfo + '](' + link + ')';

      this.quoteText = markdown;
      this.$bvModal.show('quote-modal');
    },
    showAbout () {
      this.$bvModal.show('about-modal');
    }
  },
  computed: {
    selectedTranslationMeta () {
      return this.translationMeta.filter((meta) => this.selectedTranslations.some((translation) => translation.toLowerCase() === meta.key.toLowerCase()));
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
  },
  data: () => ({
    quoteText: '',
    saveSelection: true,
    selectedSections: [],
    loading: false,
    sectionsTree: [],
    sectionsFlat: [],
    translations: null,
    translationMeta: [
      {
        key: 'casaubon',
        author: 'Meric Casaubon',
        year: 1634,
        label: 'Casaubon, Meric (1634)'
      },
      {
        key: 'chrystal',
        author: 'George William Chrystal',
        year: 1902,
        label: 'Chrystal, George William (1902)'
      },
      {
        key: 'collier',
        author: 'Jeremy Collier',
        year: 1702,
        label: 'Collier, Jeremy (1702)'
      },
      {
        key: 'farquharson',
        author: 'A. S. L. Farquharson',
        year: 1944,
        label: 'Farquharson, A. S. L. (1944)'
      },
      {
        key: 'graves',
        author: 'R. Graves',
        year: 1792,
        label: 'Graves, R. (1792)'
      },
      {
        key: 'haine',
        author: 'C. R. Haines',
        year: 1916,
        label: 'Haines, C. R. (1916)'
      },
      {
        key: 'jackson',
        author: 'J. Jackson',
        year: 1906,
        label: 'Jackson, J. (1906)'
      },
      {
        key: 'long',
        author: 'George Long',
        year: 1862,
        label: 'Long, George (1862)'
      },
      {
        key: 'maccormac',
        author: 'H. McCormac',
        year: 1844,
        label: 'McCormac, H. (1844)'
      },
      {
        key: 'hutcheson',
        author: 'James Moor and Francis Hutcheson',
        year: 1742,
        label: 'Moor, James and Hutcheson, Francis (1742)'
      },
      {
        key: 'rendallv1',
        author: 'G. H. Rendall',
        year: 1898,
        label: 'Rendall, G. H. (1898)'
      },
      {
        key: 'rendallv2',
        author: 'G. H. Rendall',
        year: 1901,
        label: 'Rendall, G. H. (1901)'
      },
      {
        key: 'thomson',
        author: 'James Thomson',
        year: 1747,
        label: 'Thomson, James (1747)'
      }
    ],
    selectedTranslations: []
  })
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

</style>

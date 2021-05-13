<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12 col-lg-3">
        <div class="mt-2">Translations</div>
        <v-select multiple :options="translationMeta" v-model="selectedTranslations" :reduce="translation => translation.key"></v-select>

        <div class="mt-2 mt-lg-4">Chapters</div>
        <v-select multiple :options="sectionsFlat" v-model="selectedSections"></v-select>

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
        <span class="hint-text float-right d-none d-lg-inline-block">Select multiple chapters through the dropdown box, or an individual chapter through the list.</span>
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
              <td v-for="(translationInfo, index) in selectedTranslationMeta" :key="translationInfo.key">
                <span v-if="index === 0" class="d-lg-none"><strong>{{ section }}</strong></span>
                {{ findSectionData(section)[translationInfo.key] }}
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const axios = require('axios');

export default {
  name: 'App',
  components: {},
  mounted () {
    this.loading = true;
    axios.get(window.stoicsource.settings.apiUrl)
        .then(function (response) {
          this.translations = response.data;
          this.extractSections();
        }.bind(this))
        .catch(function (error) {
          // handle error
          console.log(error);
        })
        .then(function () {
          this.loading = false;
        }.bind(this));
    this.readLocalStorage();
    this.applyUrlParams();
  },
  methods: {
    writeLocalStorage () {
      localStorage.selectedTranslations = JSON.stringify(this.selectedTranslations);
      localStorage.selectedSections = JSON.stringify(this.selectedSections);
    },
    readLocalStorage () {
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
    $route() {
      this.applyUrlParams();
    }
  },
  data: () => ({
    selectedSections: ['8.12'],
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
    selectedTranslations: ['casaubon', 'farquharson', 'long']
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
  /* margin-top: 60px; */
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

</style>

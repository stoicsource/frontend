<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12 col-lg-2">
        Translations to show
        <v-select multiple :options="translationMeta" v-model="selectedTranslations" :reduce="translation => translation.key"></v-select>

        Sections
        <div class="accordion" role="tablist">
          <b-card no-body class="mb-1" v-for="book in sections" :key="book.key">
            <b-card-header header-tag="header" class="p-1" role="tab" v-b-toggle="'collapseBook' + book.key">
              Book {{ book.key }}
            </b-card-header>
            <b-collapse :id="'collapseBook' + book.key" accordion="my-accordion" role="tabpanel">
              <b-card-body>
                <b-card-text>
                  <div v-for="chapter in book.sections" :key="book.key + '-' + chapter">{{ chapter }}</div>
                </b-card-text>
              </b-card-body>
            </b-collapse>
          </b-card>
        </div>

      </div>
      <div class="col-12 col-lg-10">
        <div v-if="loading">loading...</div>
        <div v-if="translations">
          <table class="table">
            <tr>
              <th></th>
              <th v-for="translationInfo in selectedTranslationMeta" :key="translationInfo.key">{{ translationInfo.author }}</th>
            </tr>

            <tr v-for="section in translations" :key="section.SectionNumber">
              <td>{{ section.SectionNumber }}</td>
              <td v-for="translationInfo in selectedTranslationMeta" :key="translationInfo.key">{{ section[translationInfo.key] }}</td>
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
  },
  methods: {
    translationSelected (translationKey) {
      return this.selectedTranslations.includes(translationKey);
    },
    writeLocalStorage () {
      localStorage.selectedTranslations = JSON.stringify(this.selectedTranslations);
    },
    readLocalStorage () {
      if (localStorage.selectedTranslations) {
        this.selectedTranslations = JSON.parse(localStorage.selectedTranslations);
      }
    },
    extractSections () {
      this.sections = [];
      this.translations.forEach((translation) => {
        let numberParts = translation.SectionNumber.split('.');
        let book = numberParts[0];
        let chapter = numberParts[1] ;

        let bookSection = this.sections.find((section) => section.key === book);
        if (!bookSection) {
          bookSection = {
            key: book,
            sections: []
          };
          this.sections.push(bookSection);
        }

        bookSection.sections.push(chapter);
      });
    }
  },
  computed: {
    selectedTranslationMeta () {
      return this.translationMeta.filter((meta) => this.selectedTranslations.includes(meta.key));
    }
  },
  watch: {
    selectedTranslations () {
      this.writeLocalStorage();
    }
  },
  data: () => ({
    test: [],
    loading: false,
    sections: [],
    translations: null,
    translationMeta: [
      {
        key: 'Casaubon',
        author: 'Meric Casaubon',
        year: 1634,
        label: 'Casaubon, Meric (1634)'
      },
      {
        key: 'Chrystal',
        author: 'George William Chrystal',
        year: 1902,
        label: 'Chrystal, George William (1902)'
      },
      {
        key: 'Collier',
        author: 'Jeremy Collier',
        year: 1702,
        label: 'Collier, Jeremy (1702)'
      },
      {
        key: 'Farquharson',
        author: 'A. S. L. Farquharson',
        year: 1944,
        label: 'Farquharson, A. S. L. (1944)'
      },
      {
        key: 'Graves',
        author: 'R. Graves',
        year: 1792,
        label: 'Graves, R. (1792)'
      },
      {
        key: 'Haine',
        author: 'C. R. Haines',
        year: 1916,
        label: 'Haines, C. R. (1916)'
      },
      {
        key: 'Jackson',
        author: 'J. Jackson',
        year: 1906,
        label: 'Jackson, J. (1906)'
      },
      {
        key: 'Long',
        author: 'George Long',
        year: 1862,
        label: 'Long, George (1862)'
      },
      {
        key: 'Maccormac',
        author: 'H. McCormac',
        year: 1844,
        label: 'McCormac, H. (1844)'
      },
      {
        key: 'Hutcheson',
        author: 'James Moor and Francis Hutcheson',
        year: 1742,
        label: 'Moor, James and Hutcheson, Francis (1742)'
      },
      {
        key: 'RendallV1',
        author: 'G. H. Rendall',
        year: 1898,
        label: 'Rendall, G. H. (1898)'
      },
      {
        key: 'RendallV2',
        author: 'G. H. Rendall',
        year: 1901,
        label: 'Rendall, G. H. (1901)'
      },
      {
        key: 'Thomson',
        author: 'James Thomson',
        year: 1747,
        label: 'Thomson, James (1747)'
      }
    ],
    selectedTranslations: ['Casaubon', 'Farquharson', 'RendallV2']
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

</style>

<template>
  <div id="app">
    <md-toolbar>
      <md-field>
        <label for="translations">Translations</label>
        <md-select v-model="selectedTranslations" name="translations" id="translations" multiple>
          <md-option v-for="translation in translationMeta" :key="translation.key" :value="translation.key">{{ translation.author }} ({{ translation.year }})</md-option>
        </md-select>
      </md-field>
    </md-toolbar>
    <md-content>
      <div v-if="loading">loading...</div>
      <div v-if="translations">
        <md-table>
          <md-table-row>
            <md-table-head></md-table-head>
            <md-table-head v-for="translationInfo in selectedTranslationMeta" :key="translationInfo.key">{{ translationInfo.author }}</md-table-head>
          </md-table-row>

          <md-table-row v-for="section in translations" :key="section.SectionNumber">
            <md-table-cell>{{ section.SectionNumber }}</md-table-cell>
            <md-table-cell v-for="translationInfo in selectedTranslationMeta" :key="translationInfo.key">{{ section[translationInfo.key] }}</md-table-cell>
          </md-table-row>

        </md-table>
      </div>
    </md-content>
  </div>
</template>

<script>
const axios = require('axios');

export default {
  name: 'App',
  components: {},
  mounted () {
    this.loading = true;
    let $sourceUrl = 'http://localhost:8080/meditations';
    // http://localhost:8080/meditations
    // https://api.littlestoic.com/meditations
    // https://sources.littlestoic.com/meditations
    axios.get($sourceUrl)
        .then(function (response) {
          this.translations = response.data;
        }.bind(this))
        .catch(function (error) {
          // handle error
          console.log(error);
        })
        .then(function () {
          this.loading = false;
        }.bind(this));
  },
  methods: {
    translationSelected (translationKey) {
      return this.selectedTranslations.includes(translationKey);
    }
  },
  computed: {
    selectedTranslationMeta () {
      return this.translationMeta.filter((meta) => this.selectedTranslations.includes(meta.key));
    }
  },
  data: () => ({
    loading: false,
    translations: null,
    translationMeta: [
      {
        key: 'Casaubon',
        author: 'Meric Casaubon',
        year: 1634
      },
      {
        key: 'Chrystal',
        author: 'George William Chrystal',
        year: 1902
      },
      {
        key: 'Collier',
        author: 'Jeremy Collier',
        year: 1702
      },
      {
        key: 'Farquharson',
        author: 'A. S. L. Farquharson',
        year: 1944
      },
      {
        key: 'Graves',
        author: 'R. Graves',
        year: 1792
      },
      {
        key: 'Haines',
        author: 'C. R. Haines',
        year: 1916
      },
      {
        key: 'Jackson',
        author: 'J. Jackson',
        year: 1906
      },
      {
        key: 'Long',
        author: 'George Long',
        year: 1862
      },
      {
        key: 'Maccormac',
        author: 'H. McCormac',
        year: 1844
      },
      {
        key: 'Hutcheson',
        author: 'James Moor and Francis Hutcheson',
        year: 1742
      },
      {
        key: 'RendallV1',
        author: 'G. H. Rendall',
        year: 1898
      },
      {
        key: 'RendallV2',
        author: 'G. H. Rendall',
        year: 1901
      },
      {
        key: 'Thomson',
        author: 'James Thomson',
        year: 1747
      }
    ],
    selectedTranslations: ['Casaubon', 'Farquharson', 'RendallV1']
  })
}
</script>

<style>
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

.md-menu-content.md-select-menu {
  max-width: 480px;
  max-height: 65vh;
}

</style>

<template>
  <table class="table">
    <tr>
      <th class="d-none d-lg-table-cell"></th>
      <th v-for="edition in editions" :key="edition.id">{{ edition.authorsFormatted }} ({{ edition.year }})</th>
    </tr>

    <tr v-for="tocEntry in tocEntries" :key="tocEntry.id">
      <td class="d-none d-lg-table-cell text-center toc-label-cell">
        <a @click="previousTocEntry(tocEntry)" v-if="tocEntries.length === 1" class="btn btn-outline-secondary btn-sm hover-button">Previous</a>
        {{ tocEntry.label }}<br>
        <a @click="deselectTocEntry(tocEntry)" v-if="tocEntries.length > 1" class="btn btn-outline-secondary btn-sm hover-button">X</a>
        <a @click="nextTocEntry(tocEntry)" v-if="tocEntries.length === 1" class="btn btn-outline-secondary btn-sm hover-button">Next</a>
      </td>
      <td v-for="(edition, index) in editions" :key="edition.id" class="translation-section">
        <div class="translation-content">
          <span v-if="index === 0" class="d-lg-none"><strong>{{ tocEntry.label }}</strong></span>
          <p v-for="paragraph in getContent(tocEntry, edition).split('\n')" :key="paragraph">{{ paragraph }}</p>
          <div v-if="getContent(tocEntry, edition) === '' && isLoading">Loading</div>
        </div>
      </td>
    </tr>
  </table>
</template>

<script>
//<span class="quote-translation" @click="quoteTranslation(section, translationInfo.key)">quote</span>
import Content from "@/store/models/Content";

export default {
  props: {
    editions: Array,
    tocEntries: Array,
  },
  components: {},
  data () {
    return {
      isLoading: false,
      lastRequestParamString: ''
    }
  },
  watch: {
    'editions': function () {
      // this.loadContents();
    },
    'tocEntries': function () {
      // this.loadContents();
    }
  },
  computed: {},
  methods: {
    async loadContents () {
      if (!this.isLoading &&
          this.editions.length > 0 && this.tocEntries.length > 0
      ) {
        let editionParams = this.editions.map((edition) => 'editions[]=' + edition.id);
        let tocParams = this.tocEntries.map((tocEntry) => 'toc_entries[]=' + tocEntry.id);

        let paramString = editionParams.join('&') + '&' + tocParams.join('&');

        if (paramString !== this.lastRequestParamString) {
          this.isLoading = true;
          await Content.api().get('https://127.0.0.1:8000/api/contents?' + paramString);
          this.isLoading = false;
          this.lastRequestParamString = paramString;
        }
      }
    },

    getContent (tocEntry, edition) {
      let contentItem = Content.query()
          .where('toc_entry_id', tocEntry.id)
          .where('edition_id', edition.id)
          .first();

      if (!contentItem) {
        this.loadContents();
        return '';
      } else {
        return contentItem.content;
      }
    },

    deselectTocEntry (tocEntry) {
      tocEntry.setSelected(false);
    },

    previousTocEntry (tocEntry) {
      let previousEntry = tocEntry.getPrevious();
      if (previousEntry) {
        previousEntry.setSelected(true);
        tocEntry.setSelected(false);
      }
    },

    nextTocEntry (tocEntry) {
      let nextEntry = tocEntry.getNext();
      if (nextEntry) {
        nextEntry.setSelected(true);
        tocEntry.setSelected(false);
      }
    },
  }
}
</script>

<style lang="scss" scoped>
.toc-label-cell {
  .hover-button {
    visibility: hidden;
  }

  &:hover {
    .hover-button {
      visibility: visible;
    }
  }
}

.btn {
  display: block;
}
</style>

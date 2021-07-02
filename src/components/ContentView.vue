<template>
  <table class="table">
    <tr>
      <th class="d-none d-lg-table-cell"></th>
      <th v-for="edition in editions" :key="edition.id">{{ edition.authorsFormatted }} ({{ edition.year }})</th>
    </tr>

    <tr v-for="tocEntry in tocEntries" :key="tocEntry.id">
      <td class="d-none d-lg-table-cell text-center toc-label-cell">
        {{ tocEntry.label }}<br>
        <a @click="deselectTocEntry(tocEntry)" class="btn btn-outline-secondary btn-sm deselect-toc-link">X</a>
      </td>
      <td v-for="(edition, index) in editions" :key="edition.id" class="translation-section">
        <div class="translation-content">
          <span v-if="index === 0" class="d-lg-none"><strong>{{ tocEntry.label }}</strong></span>
          <p v-for="paragraph in getContent(tocEntry, edition).split('\n')" :key="paragraph">{{ paragraph }}</p>
        </div>
      </td>
    </tr>
  </table>
</template>

<script>
//<span class="quote-translation" @click="quoteTranslation(section, translationInfo.key)">quote</span>
import Content from "@/store/models/Content";
import TocEntry from "@/store/models/TocEntry";

export default {
  props: {
    editions: Array,
    tocEntries: Array,
  },
  components: {},
  data () {
    return {
      isLoading: false,
      requestedEditions: [],
      requestedTocEntries: []
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
          this.editions.length > 0 && this.tocEntries.length > 0 &&
          (this.editions.length !== this.requestedEditions.length || this.tocEntries.length !== this.requestedTocEntries.length) // Todo: replace with comparison of IDs
      ) {
        let editionParams = this.editions.map((edition) => 'editions[]=' + edition.id);
        let tocParams = this.tocEntries.map((tocEntry) => 'toc_entries[]=' + tocEntry.id);

        this.isLoading = true;
        await Content.api().get('https://127.0.0.1:8000/api/contents?' + editionParams.join('&') + '&' + tocParams.join('&'));
        this.isLoading = false;

        this.requestedEditions = this.editions;
        this.requestedTocEntries = this.tocEntries;
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
      TocEntry.update({
        where: tocEntry.id,
        data: {
          selected: false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.toc-label-cell {
  .deselect-toc-link {
    visibility: hidden;
  }

  &:hover {
    .deselect-toc-link {
      visibility: visible;
    }
  }
}
</style>

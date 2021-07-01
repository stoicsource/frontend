<template>
  <table class="table">
    <tr>
      <th class="d-none d-lg-table-cell"></th>
      <th v-for="edition in editions" :key="edition.id">{{ edition.authorsFormatted }} ({{ edition.year }})</th>
    </tr>

    <tr v-for="tocEntry in tocEntries" :key="tocEntry.id">
      <td class="d-none d-lg-table-cell">{{ tocEntry.label }}</td>
      <td v-for="(edition, index) in editions" :key="edition.id" class="translation-section">
        <div class="translation-content">
          <span v-if="index === 0" class="d-lg-none"><strong>{{ tocEntry.label }}</strong></span>
          {{ getContent(tocEntry, edition) }}
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
    return {}
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
    loadContents () {
      if (this.editions.length > 0 && this.tocEntries.length > 0) {
        let editionParams = this.editions.map((edition) => 'editions[]=' + edition.id);
        let tocParams = this.tocEntries.map((tocEntry) => 'toc_entries[]=' + tocEntry.id);

        Content.api().get('https://127.0.0.1:8000/api/contents?' + editionParams.join('&') + '&' + tocParams.join('&'));
      }
    },

    getContent (tocEntry, edition) {
      let contentItem = Content.query()
          .where('toc_entry_id', tocEntry.id)
          .where('edition_id', edition.id)
          .first();

      if (!contentItem) {
        this.loadContents();
      } else {
        return contentItem.content;
      }
    }
  }
}
</script>

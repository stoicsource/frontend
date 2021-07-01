<template>
  <div v-if="selectedWorkId">

    <table class="table">
      <tr>
        <th class="d-none d-lg-table-cell"></th>
        <th v-for="edition in selectedEditions" :key="edition.id">{{ edition.authorsFormatted }} ({{ edition.year }})</th>
      </tr>

      <tr v-for="tocEntry in selectedTocEntries" :key="tocEntry.id">
        <td class="d-none d-lg-table-cell">{{ tocEntry.label }}</td>
        <td v-for="(edition, index) in selectedEditions" :key="edition.id" class="translation-section">
          <div class="translation-content">
            <span v-if="index === 0" class="d-lg-none"><strong>{{ tocEntry.label }}</strong></span>
            TOC {{ tocEntry.id }} for Edition {{ edition.id }}
            <span class="quote-translation" @click="quoteTranslation(section, translationInfo.key)">quote</span>
          </div>
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
import {mapState} from 'vuex'
import Work from "@/store/models/Work";

export default {
  components: {},
  data () {
    return {}
  },
  computed: {
    ...mapState('app', [
      'selectedWorkId'
    ]),

    selectedWork () {
      return Work.query().where('id', this.selectedWorkId).with(['editions.authors', 'tocEntries']).first();
    },

    selectedEditions () {
      return this.selectedWork.editions.filter((edition) => edition.selected );
    },

    selectedTocEntries () {
      return this.selectedWork.tocEntries.filter((tocEntry) => tocEntry.selected );
    }
  },
  methods: {}
}
</script>

<template>
  <div>
    <table class="table">
      <tr>
        <th class="d-none d-lg-table-cell"></th>
        <th v-for="edition in editions" :key="edition.id">{{ edition.authorsFormatted }} ({{ edition.year }})</th>
      </tr>

      <tr v-for="tocEntry in tocEntries" :key="tocEntry.id">
        <td class="d-none d-lg-table-cell text-center toc-label-cell">
          <a @click="previousTocEntry(tocEntry)" v-if="tocEntries.length === 1 && tocEntry.hasPrevious()" class="btn btn-outline-secondary btn-sm hover-button">Previous</a>
          {{ tocEntry.label }}<br>
          <a @click="deselectTocEntry(tocEntry)" v-if="tocEntries.length > 1" class="btn btn-outline-secondary btn-sm hover-button">X</a>
          <a @click="nextTocEntry(tocEntry)" v-if="tocEntries.length === 1 && tocEntry.hasNext()" class="btn btn-outline-secondary btn-sm hover-button">Next</a>
        </td>
        <td v-for="(edition, index) in editions" :key="edition.id" class="translation-section">
          <div class="translation-content">
            <div class="mobile-controls d-lg-none" v-if="index === 0">
              <span><strong>{{ tocEntry.label }}</strong></span>
              <a @click="previousTocEntry(tocEntry)" v-if="tocEntries.length === 1 && tocEntry.hasPrevious()" class="btn btn-outline-secondary btn-sm hover-button"><font-awesome-icon icon="arrow-alt-circle-up" /></a>
              <a @click="deselectTocEntry(tocEntry)" v-if="tocEntries.length > 1" class="btn btn-outline-secondary btn-sm hover-button"><font-awesome-icon icon="times-circle" /></a>
              <a @click="nextTocEntry(tocEntry)" v-if="tocEntries.length === 1 && tocEntry.hasNext()" class="btn btn-outline-secondary btn-sm hover-button"><font-awesome-icon icon="arrow-alt-circle-down" /></a>
            </div>
            <p v-for="paragraph in getContent(tocEntry, edition).split('\n')" :key="paragraph">{{ paragraph }}</p>
            <div v-if="getContent(tocEntry, edition) === '' && isLoading">loading...</div>
            <span v-else class="quote-translation" @click="quoteTranslation(tocEntry, edition)">quote</span>
          </div>
        </td>
      </tr>
    </table>

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
  </div>
</template>

<script>
import Content from "@/store/models/Content";
import Edition from "@/store/models/Edition";
import TocEntry from "@/store/models/TocEntry";
import SelectionInfo from "@/store/models/SelectionInfo";

export default {
  props: {
    workId: Number,
    editionIds: Array,
    tocEntryIds: Array,
  },
  components: {},
  data () {
    return {
      isLoading: false,
      lastRequestParamString: '',
      quoteText: ''
    }
  },
  computed: {
    editions () {
      return Edition.query().whereIdIn(this.editionIds).with(['authors', 'work.authors']).get();
    },

    tocEntries () {
      return TocEntry.query().whereIdIn(this.tocEntryIds).with('work.tocEntries').get();
    },

    selectionInfo () {
      return SelectionInfo.find(this.workId);
    }
  },
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
          await Content.api().get(process.env.VUE_APP_API_URL + '/contents?' + paramString);
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
      this.selectionInfo.deselectTocEntry(tocEntry.id);
    },

    previousTocEntry (tocEntry) {
      let previousEntry = tocEntry.getPrevious();
      if (previousEntry) {
        this.selectionInfo.selectTocEntry(previousEntry.id);
        this.selectionInfo.deselectTocEntry(tocEntry.id);
      }
    },

    nextTocEntry (tocEntry) {
      let nextEntry = tocEntry.getNext();
      if (nextEntry) {
        this.selectionInfo.selectTocEntry(nextEntry.id);
        this.selectionInfo.deselectTocEntry(tocEntry.id);
      }
    },

    quoteTranslation (tocEntry, edition) {
      let content = this.getContent(tocEntry, edition);
      let editionAuthor = edition.authors[0];
      let workAuthor = edition.work.authors[0];
      let link = window.location.origin + '/' + edition.work.url_slug + '/' + tocEntry.label + '/' + editionAuthor.url_slug;

      let markdown = '> ' + content + "\n";
      let authorInfo = '*' + workAuthor.name + ', ' + edition.work.name + ' ' + tocEntry.label + ' (Translation by ' + editionAuthor.name + ')*';
      markdown += '[' + authorInfo + '](' + link + ')';

      this.quoteText = markdown;
      this.$bvModal.show('quote-modal');
    }
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

.translation-section {
  .translation-content {
    max-width: 35em;
    line-height: 1.6em;

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
}

.mobile-controls {
  float: left;
  margin-right: 0.5em;
  margin-bottom: 0.25em;

  a {
    margin-top: 0.2em;
  }
}
</style>

<template>
  <div class="translation-content" v-if="work && tocEntry">
    <div class="content-navigation bg-light">
      <span><strong>{{ tocEntry.label }}</strong></span>
      <a @click="previousTocEntry()" v-if="tocEntry.hasPrevious()" class="btn btn-outline-secondary btn-sm"><i class="fa-solid fa-circle-up"></i></a>
      <a @click="nextTocEntry()" v-if="tocEntry.hasNext()" class="btn btn-outline-secondary btn-sm"><i class="fa-solid fa-circle-down"></i></a>
      <a class="d-lg-none btn btn-outline-secondary btn-sm" data-bs-toggle="collapse" href="#collapseWorkEditions" role="button"><i class="fa-solid fa-list"></i></a>
      <a @click="randomTocEntry()" class="btn btn-outline-secondary btn-sm"><i class="fa-solid fa-shuffle"></i></a>
      <a v-if="canShare()" @click="shareEntry" class="btn btn-outline-secondary btn-sm"><i class="fa-solid fa-share-nodes"></i></a>
    </div>

    <h1 v-if="contentItem && contentItem.title">
      {{ contentItem.title }}</h1>

    <div v-if="contentItem &&contentItem.contentType === 'text'">
      <p v-for="paragraph in getContent(tocEntry, edition).split('\n')" :key="paragraph.substring(0, 12)">{{
          paragraph
        }}</p>
    </div>
    <div v-else v-html="getContent(tocEntry, edition)">
    </div>

    <div v-if="contentItem && contentItem.notes > ''"
         class="translator-notes">
      Translator notes: <br>
      <div v-if="contentItem.contentType === 'text'">
        {{ contentItem.notes }}
      </div>
      <div v-else v-html="contentItem.notes"></div>
    </div>
  </div>
</template>

<script>
import TocEntry from "@/store/models/TocEntry";
import SelectionInfoService from "@/services/SelectionInfoService";
import {mapMutations} from "vuex";
import Edition from "@/store/models/Edition";
import ContentService from "@/services/ContentService";

export default {
  props: {
    work: Object,
    tocEntry: Object,
    edition: Object
  },
  computed: {
    selectionInfo() {
      return SelectionInfoService.getSelectionInfo(this.work?.id);
    },

    sortedEditions() {
      let editionsIds = this.work ? this.work.editions.map((edition) => edition.id) : null;
      return editionsIds ? Edition.query().whereIdIn(editionsIds).where('quality', (value) => value >= 6).orderBy('year').with('author').all() : null;
    },

    sortedTocEntries() {
      return TocEntry.query().whereIdIn(this.work.tocEntries.map((tocEntry) => tocEntry.id)).orderBy('sort_order').withAllRecursive().all();
    },

    contentItem() {
      return ContentService.getContentItem(this.tocEntry, this.edition);
    }
  },
  methods: {
    ...mapMutations('app', ['setActiveWork']),

    getContent() {
      if (!this.contentItem) {
        this.$emit('content-missing', null);
        return '...';
      } else {
        return this.contentItem.content;
      }
    },

    navigateToTocEntry(tocEntry) {
      this.$emit('on-navigate', tocEntry)
    },

    previousTocEntry() {
      this.navigateToTocEntry(this.tocEntry?.getPrevious());
    },

    nextTocEntry() {
      this.navigateToTocEntry(this.tocEntry?.getNext());
    },

    randomTocEntry() {
      let nextEntry = this.tocEntry;
      while (this.work.tocEntries.length > 1 && nextEntry.id === this.tocEntry.id) {
        let entryIndex = Math.floor(Math.random() * this.work.tocEntries.length);
        nextEntry = this.work.tocEntries[entryIndex];
      }
      this.navigateToTocEntry(nextEntry);
    },

    isTocEntrySelected(tocEntry) {
      return this.tocEntry.id === tocEntry.id;
    },

    selectEdition(edition) {
      this.$emit('edition-selected', edition)
    },

    canShare() {
      return navigator.share;
    },

    shareEntry() {
      if (navigator.share) {
        navigator.share({
          title: this.work.authorsFormatted + ' - ' + this.work.name + ' ' + this.tocEntry.label,
          url: window.location
        }).then(() => {
          console.log('Thanks for sharing!');
        })
        .catch(console.error);
      }
    },

    editionInfo() {
      this.$emit('edition-info-clicked');
    }
  }
}
</script>

<style scoped>
.translation-content >>> blockquote {
  border-left: 3px solid #eaecf0;
  padding: 8px 22px;
}
</style>

<style lang="scss" scoped>

.btn {
  display: block;
}

.translation-content {
  max-width: 35em;
  line-height: 1.6em;

  .content-action {
    visibility: hidden;
    display: inline-block;
    padding: 0 5px;
    color: gray;
    cursor: pointer;
    border: 1px solid lightgray;
    border-radius: 6px;

    &:not(:first-child) {
      margin-left: 0.5em;
    }
  }

  &:hover {
    .content-action {
      visibility: visible;
    }
  }
}

.translator-notes {
  font-size: 0.8em;
  line-height: 1.3em;
  font-style: italic;
  color: #444;
}

.content-navigation {
  float: left;
  position: relative;
  top: 6px;
  margin-right: 0.75em;
  margin-bottom: 0.5em;
  border-radius: 3px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid rgb(222, 226, 230);

  a {
    margin-top: 0.2em;
  }
}

</style>

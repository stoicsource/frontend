<template>
  <div>
    <div class="card-text">
      <div>Table of Contents</div>
      <div v-if="tocEntries.length < 125">
        <div v-for="(tocGroup, index) in tocGroups(sortedTocEntries)" :key="index">
          <a v-for="tocEntry in tocGroup" :key="tocEntry.id" @click="selectTocEntry(tocEntry)" class="toc-link" :class="{ 'selected': isTocEntrySelected(tocEntry) }">{{ tocEntry.label }}</a>
        </div>
      </div>
      <div v-else class="mb-4">
        <ul data-v-6c06a484="" id="myTab2" class="nav nav-tabs nav-fill">
          <li v-for="(tocGroup, index) in tocGroups(tocEntries)" :key="index" class="nav-item">
            <a :href="'#pane' + index" data-bs-toggle="tab" class="nav-link" :class="{ 'active': isSelectedTocEntryInGroup(index) }">{{ index }}</a>
          </li>
        </ul>

        <div class="tab-content" style="margin-left: -0.5em;">
          <div v-for="(tocGroup, index) in tocGroups(tocEntries)" :key="index" class="tab-pane fade show" :id="'pane' + index" :class="{ 'active': isSelectedTocEntryInGroup(index) }">
            <div class="mt-2">
              <a v-for="tocEntry in tocGroup" :key="tocEntry.id" @click="selectTocEntry(tocEntry)" class="toc-link" :class="{ 'selected': isTocEntrySelected(tocEntry) }">{{ tocEntry.label }}</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="d-flex flex-row flex-wrap mt-3">
      <div class="me-2" >Translation&nbsp;by: </div>
      <div class="dropdown">
        <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button"
                id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
          {{ selectedEdition.authorsFormatted }}
        </button>
        <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
          <li v-for="edition in sortedEditions" :key="edition.id">
            <a @click="selectEdition(edition)" class="dropdown-item" href="#">{{ edition.authorsFormatted }}
              ({{ edition.year }}<span v-if="edition.language !== 'eng'">, {{ edition.language }}</span>)</a>
          </li>
        </ul>
      </div>
      <a @click="editionInfo()" class="btn btn-outline-secondary btn-sm ms-2"><i class="fa-solid fa-circle-info"></i></a>
    </div>
  </div>
</template>

<script>
import Edition from "../../store/models/Edition";
import TocEntry from "../../store/models/TocEntry";

export default {
  name: "TableOfContents",
  props: {
    tocEntries: Array,
    editions: Array,
    selectedEdition: Object,
    selectedTocEntry: Object
  },
  computed: {
    sortedEditions () {
      let editionsIds = this.editions.map((edition) => edition.id)
      return Edition.query().whereIdIn(editionsIds).where('quality', (value) => value >= 6). orderBy('year').with('author').all();
    },

    sortedTocEntries () {
      return TocEntry.query().whereIdIn(this.tocEntries.map((tocEntry) => tocEntry.id)).orderBy('sort_order').withAllRecursive().all();
    }
  },
  methods: {
    selectTocEntry (tocEntry) {
      this.$emit('toc-entry-selected', tocEntry)
    },

    selectEdition (edition) {
      this.$emit('edition-selected', edition)
    },

    editionInfo (edition) {
      this.$emit('edition-info-clicked', edition)
    },

    isTocEntrySelected (tocEntry) {
      return this.selectedTocEntry.id === tocEntry.id;
    },

    isSelectedTocEntryInGroup (groupIndex) {
      let label = this.selectedTocEntry ? this.selectedTocEntry.label : '';
      let preDot = label.split('.')[0];
      return preDot === groupIndex;
    },

    tocGroups (tocEntries) {
      let groups = {};

      tocEntries.forEach(function (tocEntry) {
        let labelParts = tocEntry.label.split('.')

        let chapter = labelParts.length > 1 ? labelParts[0] : '0';
        if (!(chapter in groups)) {
          groups[chapter] = [];
        }
        groups[chapter].push(tocEntry);
      });

      return groups;
    }
  }
}
</script>

<style lang="scss" scoped>

a.toc-link {
  display: inline-block;
  margin-left: 0.5em;
  text-decoration: underline;
  color: #222;
  font-size: 1.1em;

  &.selected {
    font-weight: bold;
  }
}

</style>
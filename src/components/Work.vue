<template>
  <div class="work">
    <div v-b-toggle="'collapseWorkEditions' + work.id" class="edition-collapser d-md-none">
      <div>
          <span v-for="(edition, index) in selectedEditions" :key="edition.id">
            <span v-if="index !== 0">, </span>
            <span>{{ selectedEditions.length > 1 ? edition.authorsShortnames : edition.authorsFormatted }} ({{ edition.year }})</span>
          </span>
      </div>
      <font-awesome-icon icon="angle-down"/>
      <font-awesome-icon icon="angle-up"/>
    </div>
    <b-collapse :id="'collapseWorkEditions' + work.id" class="edition-list" :visible="!isMobile()">
      <div><strong>Translations</strong></div>
      <div v-for="edition in work.editions" :key="edition.id">
        <b-form-checkbox :checked="isEditionSelected(edition)" :name="'check-button-' + edition.id" switch @change="toggleEdition(edition)">
          {{ edition.authorsFormatted }} ({{ edition.year }})
        </b-form-checkbox>
      </div>
      <b-card-text class="mt-3">
        <div><strong>Table of Contents</strong></div>
        <div v-for="(tocGroup, index) in tocGroups(work.tocEntries)" :key="index">
          <a v-for="tocEntry in tocGroup" :key="tocEntry.id" @click="toggleTocEntry(tocEntry)" class="toc-link" :class="{ 'selected': isTocEntrySelected(tocEntry) }">{{ tocEntry.label }}</a>
        </div>
      </b-card-text>
    </b-collapse>
  </div>
</template>

<script>
import Edition from "@/store/models/Edition";
import Work from "@/store/models/Work";
import SelectionInfo from "@/store/models/SelectionInfo";

export default {
  name: 'work',
  components: {},
  props: {
    workId: Number
  },
  data () {
    return {}
  },
  computed: {
    work () {
      return Work.query().whereId(this.workId).with(['tocEntries', 'editions.authors', 'authors']).first();
    },

    selectionInfo () {
      return SelectionInfo.find(this.workId);
    },

    selectedEditions () {
      return this.selectionInfo ? Edition.query().whereIdIn(this.selectionInfo.editions).with('authors').all() : [];
    }
  },
  methods: {
    selectWork (work) {
      this.$emit('update-selected-work', work);
    },

    toggleEdition (edition) {
      setTimeout(function () {
        let entryIndex = this.selectionInfo.editions.indexOf(edition.id);
        if (entryIndex >= 0 && this.selectionInfo.editions.length > 1) {
          this.selectionInfo.editions.splice(entryIndex, 1);
        } else {
          this.selectionInfo.editions.push(edition.id);
        }

        SelectionInfo.update({
          where: this.work.id,
          data: {
            editions: this.selectionInfo.editions
          }
        })
      }.bind(this), 1);
    },

    toggleTocEntry (tocEntry) {
      let entryIndex = this.selectionInfo.tocEntries.indexOf(tocEntry.id);
      if (entryIndex >= 0) {
        this.selectionInfo.deselectTocEntry(tocEntry.id);
      } else {
        this.selectionInfo.selectTocEntry(tocEntry.id);
      }
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
    },

    isEditionSelected (edition) {
      return this.selectionInfo && this.selectionInfo.editions.includes(edition.id);
    },

    isTocEntrySelected (tocEntry) {
      return this.selectionInfo && this.selectionInfo.tocEntries.includes(tocEntry.id);
    },

    isMobile () {
      return window.screen.width <= 768;
    }
  }
}
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style lang="scss" scoped>
a.toc-link {
  display: inline-block;
  margin-left: 0.3em;
  text-decoration: underline;

  &.selected {
    font-weight: bold;
  }
}

.edition-collapser {
  padding: 3px 6px;
  border: 1px solid transparent;
  border-radius: 3px;
  display: flex;
  justify-content: space-between;

  svg {
    position: relative;
    top: 4px;
    right: 2px;
  }

  &.collapsed {
    border-color: lightgray;

    .fa-angle-up {
      display: none;
    }
  }

  &.not-collapsed {
    .fa-angle-down {
      display: none;
    }
  }
}

.edition-list {
  padding-left: 0.5em;
}

.author-name {
  color: #666;
}
</style>
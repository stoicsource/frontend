<script setup lang="ts">
import type { TocEntry } from "@/models/TocEntry";
import type { Edition } from "@/models/Edition";
import { computed } from "vue";
import { EDITION_QUALITY_THRESHOLD } from "@/constants";

const props = defineProps<{
  tocEntries: TocEntry[];
  editions: Edition[];
  selectedTocEntry: TocEntry;
  selectedEdition: Edition;
}>();

const emit = defineEmits([
  "toc-entry-selected",
  "edition-selected",
  "edition-info-clicked",
]);

const sortedEditions = computed(() => {
  return props.editions
    .filter((edition) => {
      return edition.quality >= EDITION_QUALITY_THRESHOLD;
    })
    .sort((a, b) => {
      return a.year > b.year ? 1 : -1;
    });
});

const sortedTocEntries = computed(() => {
  return [...props.tocEntries].sort((a, b) => {
    return a.sortOrder > b.sortOrder ? 1 : -1;
  });
});

function selectTocEntry(tocEntry: TocEntry) {
  emit("toc-entry-selected", tocEntry);
}

function selectEdition(edition: Edition) {
  emit("edition-selected", edition);
}

function editionInfo(edition: Edition) {
  emit("edition-info-clicked", edition);
}

function isTocEntrySelected(tocEntry: TocEntry) {
  return props.selectedTocEntry.id === tocEntry.id;
}

function isSelectedTocEntryInGroup(groupIndex: number) {
  const label = props.selectedTocEntry ? props.selectedTocEntry.label : "";
  const preDot = parseInt(label.split(".")[0] || "0");
  return preDot === groupIndex;
}

function tocGroups(tocEntries: TocEntry[]) {
  const groups = new Map<number, TocEntry[]>();

  tocEntries.forEach(function (tocEntry) {
    const labelParts = tocEntry.label.split(".");

    const chapter = parseInt(
      labelParts.length > 1 ? labelParts[0] || "0" : "0",
    );
    let entries = [tocEntry];
    const entriesInGroup = groups.get(chapter);
    if (entriesInGroup) {
      entries = entriesInGroup.concat(entries);
    }
    groups.set(chapter, entries);
  });

  return groups;
}
</script>

<template>
  <div>
    <div class="card-text">
      <div>Table of Contents</div>
      <div v-if="tocEntries.length < 125">
        <div>
          <a
            v-for="tocEntry in sortedTocEntries"
            :key="tocEntry.id"
            @click="selectTocEntry(tocEntry)"
            class="toc-link"
            :class="{ selected: isTocEntrySelected(tocEntry) }"
            >{{ tocEntry.label }}</a
          >
        </div>
      </div>
      <div v-else class="mb-4">
        <ul data-v-6c06a484="" id="myTab2" class="nav nav-tabs nav-fill">
          <li
            v-for="[index] in tocGroups(tocEntries).entries()"
            :key="index"
            class="nav-item"
          >
            <a
              :href="'#pane' + index"
              data-bs-toggle="tab"
              class="nav-link"
              :class="{ active: isSelectedTocEntryInGroup(index) }"
              >{{ index }}</a
            >
          </li>
        </ul>

        <div class="tab-content" style="margin-left: -0.5em">
          <div
            v-for="[index, tocGroup] in tocGroups(tocEntries).entries()"
            :key="index"
            class="tab-pane fade show"
            :id="'pane' + index"
            :class="{ active: isSelectedTocEntryInGroup(index) }"
          >
            <div class="mt-2">
              <a
                v-for="tocEntry in tocGroup"
                :key="tocEntry.id"
                @click="selectTocEntry(tocEntry)"
                class="toc-link"
                :class="{ selected: isTocEntrySelected(tocEntry) }"
                >{{ tocEntry.label }}</a
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="d-flex flex-row flex-wrap mt-3">
      <div class="me-2">Translation&nbsp;by:</div>
      <div class="dropdown">
        <button
          class="btn btn-outline-secondary btn-sm dropdown-toggle"
          type="button"
          id="dropdownMenuButton1"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          {{ selectedEdition.authorsFormatted }}
        </button>
        <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
          <li v-for="edition in sortedEditions" :key="edition.id">
            <a
              @click.prevent="selectEdition(edition)"
              class="dropdown-item"
              href="#"
              >{{ edition.authorsFormatted }} ({{ edition.year
              }}<span v-if="edition.language !== 'eng'"
                >, {{ edition.language }}</span
              >)</a
            >
          </li>
        </ul>
      </div>
      <a
        @click="editionInfo(selectedEdition)"
        class="btn btn-outline-secondary btn-sm ms-2"
        ><i class="fa-solid fa-circle-info"></i
      ></a>
    </div>
  </div>
</template>

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

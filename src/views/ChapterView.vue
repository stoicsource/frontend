<script setup lang="ts">
import { useWorksStore } from "@/stores/works";
import { computed } from "vue";
import type { Work } from "@/models/Work";
import ChapterNavigator from "../components/chapter/ChapterNavigator.vue";
import TableOfContents from "../components/chapter/TableOfContents.vue";
import type { Edition } from "@/models/Edition";
import type { TocEntry } from "@/models/TocEntry";
import { useRouter } from "vue-router";
import { useGeneralStore } from "@/stores/general";
import { useChaptersStore } from "@/stores/chapters";
import { useSelectionStore } from "@/stores/selection";

const props = defineProps<{
  workSlug: string;
  tocSlug?: string;
  translatorSlug?: string;
}>();

const router = useRouter();
const generalStore = useGeneralStore();
const worksStore = useWorksStore();
const chaptersStore = useChaptersStore();
const selectionStore = useSelectionStore();

const work = computed(() => {
  const workShallow = worksStore.works.find((work: Work) => {
    return work.urlSlug === props.workSlug;
  });

  return workShallow ? worksStore.getWorkDetails(workShallow.id) : null;
});
worksStore.activeWork = work.value !== undefined ? work.value : null;

const edition = computed(() => {
  if (!work.value || !work.value.editions) {
    return null;
  }

  if (props.translatorSlug) {
    return work.value.editions?.find((edition) => {
      return edition.author.urlSlug === props.translatorSlug;
    });
  }

  const selectionInfo = selectionStore.getSelectionInfo(work.value.id);
  return selectionInfo.editionIds.length > 0
    ? work.value.editions.find((edition) => {
        return edition.id === selectionInfo.editionIds[0];
      })
    : work.value.editions[0];
});

const tocEntry = computed(() => {
  if (!work.value || !work.value.tocEntries) {
    return null;
  }

  // order: 1. url, 2. selection, 3. first chapter
  let tocEntry = props.tocSlug
    ? work.value.tocEntries.find((tocEntry) => {
        return tocEntry.label === props.tocSlug;
      })
    : null;

  if (!tocEntry) {
    const selectionInfo = selectionStore.getSelectionInfo(work.value.id);
    if (selectionInfo.tocEntryIds.length > 0) {
      tocEntry = work.value.tocEntries.find((tocEntry) => {
        return tocEntry.id === selectionInfo.tocEntryIds[0];
      });
    }
  }

  if (!tocEntry) {
    tocEntry = work.value.tocEntries[0];
  }

  return tocEntry;
});

function isMobile() {
  return window.screen.width <= 768;
}

const sortedEditions = computed(() => {
  if (!work.value || !work.value.editions) {
    return [];
  }

  return work.value?.editions
    ?.filter((edition) => {
      return edition.quality >= 6;
    })
    .sort((a: Edition, b: Edition) => {
      return a.year > b.year ? 1 : -1;
    });
});

const sortedTocEntries = computed(() => {
  if (!work.value || !work.value.tocEntries) {
    return [];
  }

  return work.value?.tocEntries
    ?.filter(() => {
      return true;
    })
    .sort((a: TocEntry, b: TocEntry) => {
      return a.sortOrder > b.sortOrder ? 1 : -1;
    });
});

function navigateToTocEntry(tocEntry: TocEntry | null) {
  if (tocEntry) {
    const selectionInfo = selectionStore.getSelectionInfo(work.value?.id ?? -1);
    selectionInfo.replaceTocEntry(tocEntry.id);
    selectionStore.saveToLocalStorage();
    router.push({
      name: "contentByToc",
      params: {
        author: work.value?.author?.urlSlug,
        workSlug: work.value?.urlSlug,
        tocSlug: tocEntry.label,
        translatorSlug: edition.value?.author?.urlSlug,
      },
    });
  }
}

function selectEdition(edition: Edition) {
  setTimeout(function () {
    const selectionInfo = selectionStore.getSelectionInfo(work.value?.id ?? -1);
    selectionInfo.selectEdition(edition.id);
    selectionStore.saveToLocalStorage();
    router.push({
      name: "contentByToc",
      params: {
        author: work.value?.author?.urlSlug,
        workSlug: work.value?.urlSlug,
        tocSlug: tocEntry.value?.label,
        translatorSlug: edition.author?.urlSlug,
      },
    });
  }, 1);
}

function requireContent() {
  if (tocEntry.value && edition.value && !generalStore.loading) {
    generalStore.loading = !chaptersStore.isContentItemLoaded(
      tocEntry.value,
      edition.value
    );
    chaptersStore
      .requireContent(tocEntry.value, edition.value)
      .finally(function () {
        generalStore.loading = false;
      });
  }
}

function editionInfo() {
  router.push({
    name: "editionInfo",
    params: {
      editionId: edition.value?.id,
    },
  });
}
</script>

<template>
  <div>
    <div class="work">
      <div class="container">
        <div class="row" v-if="work && tocEntry && edition">
          <div class="col-12 col-lg-3">
            <div
              class="collapse top-toc"
              id="collapseWorkEditions"
              :class="{ show: !isMobile() }"
              style="position: relative"
            >
              <a
                class="toc-toggler d-lg-none"
                data-bs-toggle="collapse"
                href="#collapseWorkEditions"
                role="button"
              >
                <i class="fa-solid fa-xmark fa-2xl"></i>
              </a>
              <table-of-contents
                :editions="sortedEditions"
                :toc-entries="sortedTocEntries"
                :selected-edition="edition"
                :selected-toc-entry="tocEntry"
                @toc-entry-selected="navigateToTocEntry"
                @edition-selected="selectEdition"
                @edition-info-clicked="editionInfo"
              ></table-of-contents>
            </div>
          </div>
          <div class="col-12 col-lg-9">
            <chapter-navigator
              :work="work"
              :edition="edition"
              :toc-entry="tocEntry"
              @on-navigate="navigateToTocEntry"
              @edition-selected="selectEdition"
              @content-missing="requireContent"
            ></chapter-navigator>
          </div>
        </div>
        <div v-else>
          <div v-if="work && !edition">
            Edition "{{ translatorSlug }}" not found.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.work {
  padding-top: 0.7em;
}

.top-toc {
  padding: 0.7em 0;
  border-bottom: 1px solid darkgrey;
  margin-bottom: 1.2em;
}

.toc-toggler {
  position: absolute;
  right: 0.7em;
  top: 0.1em;
  size: 1.2em;
  color: darkgrey;
}
</style>

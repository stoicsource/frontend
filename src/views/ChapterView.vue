<script setup lang="ts">
import { useWorksStore } from "@/stores/works";
import { computed } from "vue";
import { Work } from "@/models/Work";
import ChapterNavigator from "../components/chapter/ChapterNavigator.vue";
import { Edition } from "@/models/Edition";
import { TocEntry } from "@/models/TocEntry";
import { useRouter } from "vue-router";
import { useGeneralStore } from "@/stores/general";
import { useChaptersStore } from "@/stores/chapters";

const props = defineProps<{
  workSlug: string;
  tocSlug?: string;
  translatorSlug?: string;
}>();

const router = useRouter();
const generalStore = useGeneralStore();
const worksStore = useWorksStore();
const chaptersStore = useChaptersStore();

const work = computed(() => {
  const workShallow = worksStore.works.find((work: Work) => {
    return work.urlSlug === props.workSlug;
  });

  return workShallow ? worksStore.getWorkDetails(workShallow.id) : null;
});

const edition = computed(() => {
  if (!work.value) {
    return undefined;
  }
  if (props.translatorSlug) {
    return work.value.editions?.find((edition) => {
      return edition.author.urlSlug === props.translatorSlug;
    });
  }
  // let selectedEdition = (this.selectionInfo && this.selectionInfo.editions.length > 0) ? Edition.query().whereId(this.selectionInfo.editions[0]).with(['author']).first() : null;
  // if (selectedEdition) {
  //   return selectedEdition;
  // } else {
  //   return this.sortedEditions?.length > 0 ? this.sortedEditions[this.sortedEditions.length - 1] : null;
  // }

  // TODO:
  return work.value.editions ? work.value.editions[0] : undefined;
});

const tocEntry = computed(() => {
  // order: 1. url, 2. selection, 3. first chapter
  // let tocSlugEntry = this.tocSlug ? TocEntry.query().where('work_id', this.work?.id).where('label', this.tocSlug).first() : null;
  // let tocEntryId = tocSlugEntry ? tocSlugEntry.id : null;
  //
  // if (!tocEntryId) {
  //   tocEntryId = (this.selectionInfo && this.selectionInfo.tocEntries.length > 0) ? this.selectionInfo.tocEntries[0] : null;
  // }
  //
  // if (!tocEntryId) {
  //   tocEntryId = this.work?.firstTocEntry?.id;
  // }
  //
  // return tocEntryId ? TocEntry.query().whereId(tocEntryId).with(['work.tocEntries']).first() : null;

  if (!work.value) {
    return null;
  }

  return work.value.tocEntries ? work.value.tocEntries[0] : null;
});

function isMobile() {
  return window.screen.width <= 768;
}

const sortedEditions = computed(() => {
  return work.value?.editions
    ?.filter((edition) => {
      return edition.quality >= 6;
    })
    .sort((a: Edition, b: Edition) => {
      return a.year > b.year ? 1 : -1;
    });
});

const sortedTocEntries = computed(() => {
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
    // TODO: this.selectionInfo.replaceTocEntry(tocEntry.id);
    // TODO: SelectionInfoService.saveToLocalStorage();
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
    // TODO:
    // this.selectionInfo.editions[0] = edition.id;
    //
    // SelectionInfo.update({
    //   where: this.work.id,
    //   data: {
    //     editions: this.selectionInfo.editions,
    //   },
    // });
    //
    // SelectionInfoService.saveToLocalStorage();
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
    chaptersStore.requireContent(tocEntry.value, edition.value).finally(
      function () {
        generalStore.loading = false;
      }
    );
  }
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
              <!--
              <table-of-contents
                :editions="sortedEditions"
                :toc-entries="sortedTocEntries"
                :selected-edition="edition"
                :selected-toc-entry="tocEntry"
                @toc-entry-selected="navigateToTocEntry"
                @edition-selected="selectEdition"
                @edition-info-clicked="editionInfo"
              ></table-of-contents>
              -->
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

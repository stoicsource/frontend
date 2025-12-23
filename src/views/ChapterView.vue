<script setup lang="ts">
import ChapterNavigator from "../components/chapter/ChapterNavigator.vue";
import TableOfContents from "../components/chapter/TableOfContents.vue";
import { useWorkContext } from "@/composables/useWorkContext";
import { useChapterNavigation } from "@/composables/useChapterNavigation";
import { useChapterLoader } from "@/composables/useChapterLoader";

const props = defineProps<{
  workSlug: string;
  tocSlug?: string;
  translatorSlug?: string;
}>();

const { work, edition, tocEntry, sortedEditions, sortedTocEntries } =
  useWorkContext(props);

const { navigateToTocEntry, selectEdition, editionInfo } = useChapterNavigation(
  work,
  edition,
  tocEntry,
);

const { requireChapter } = useChapterLoader(tocEntry, edition);

function isMobile() {
  return window.screen.width <= 768;
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
              @content-missing="requireChapter"
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

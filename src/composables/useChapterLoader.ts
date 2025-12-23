import { ref, type ComputedRef } from "vue";
import type { Edition } from "@/models/Edition";
import type { TocEntry } from "@/models/TocEntry";
import { useChaptersStore } from "@/stores/chapters";

interface ChapterLoaderReturn {
  requireChapter: () => void;
}

/**
 * Composable for managing chapter loading state
 * Prevents duplicate requests for the same chapter
 */
export function useChapterLoader(
  tocEntry: ComputedRef<TocEntry | null | undefined>,
  edition: ComputedRef<Edition | null | undefined>,
): ChapterLoaderReturn {
  const chaptersStore = useChaptersStore();
  const lastRequiredTocEntryId = ref<number | null>(null);
  const lastRequiredEditionId = ref<number | null>(null);

  function requireChapter() {
    if (tocEntry.value && edition.value && !chaptersStore.chaptersLoading) {
      if (
        lastRequiredTocEntryId.value &&
        lastRequiredTocEntryId.value === tocEntry.value.id &&
        lastRequiredEditionId.value &&
        lastRequiredEditionId.value === edition.value.id
      ) {
        return;
      }

      chaptersStore.chaptersLoading = !chaptersStore.isChapterLoaded(
        tocEntry.value,
        edition.value,
      );
      chaptersStore
        .requireChapter(tocEntry.value, edition.value)
        .finally(function () {
          lastRequiredTocEntryId.value = tocEntry.value?.id ?? null;
          lastRequiredEditionId.value = edition.value?.id ?? null;
          chaptersStore.chaptersLoading = false;
        });
    }
  }

  return {
    requireChapter,
  };
}

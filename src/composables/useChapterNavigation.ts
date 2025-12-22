import { type ComputedRef } from "vue";
import { useRouter } from "vue-router";
import type { Work } from "@/models/Work";
import type { Edition } from "@/models/Edition";
import type { TocEntry } from "@/models/TocEntry";
import { useChaptersStore } from "@/stores/chapters";
import { useSelectionStore } from "@/stores/selection";

interface ChapterNavigationReturn {
  navigateToTocEntry: (tocEntry: TocEntry | null) => void;
  selectEdition: (edition: Edition) => void;
  editionInfo: () => void;
}

/**
 * Composable for handling navigation between chapters and editions
 */
export function useChapterNavigation(
  work: ComputedRef<Work | undefined>,
  edition: ComputedRef<Edition | null | undefined>,
  tocEntry: ComputedRef<TocEntry | null | undefined>
): ChapterNavigationReturn {
  const router = useRouter();
  const chaptersStore = useChaptersStore();
  const selectionStore = useSelectionStore();

  function navigateToTocEntry(tocEntry: TocEntry | null) {
    if (tocEntry) {
      if (edition.value) {
        chaptersStore.chaptersLoading = true;
        chaptersStore.requireChapter(tocEntry, edition.value).then(() => {
          chaptersStore.chaptersLoading = false;
        });
      }
      const selectionInfo = selectionStore.getSelectionInfo(work.value?.id ?? -1);
      selectionInfo.replaceTocEntry(tocEntry.id);
      selectionStore.saveToLocalStorage();
      router.push({
        name: "contentByTocAndTranslator",
        params: {
          author: work.value?.author?.urlSlug,
          workSlug: work.value?.urlSlug,
          tocSlug: tocEntry.label,
          translatorSlug: edition.value?.author?.urlSlug,
        },
      });
    }
  }

  function selectEdition(newEdition: Edition) {
    const selectionInfo = selectionStore.getSelectionInfo(work.value?.id ?? -1);
    selectionInfo.selectEdition(newEdition.id);
    selectionStore.saveToLocalStorage();
    router.push({
      name: "contentByTocAndTranslator",
      params: {
        author: work.value?.author?.urlSlug,
        workSlug: work.value?.urlSlug,
        tocSlug: tocEntry.value?.label,
        translatorSlug: newEdition.author?.urlSlug,
      },
    });
  }

  function editionInfo() {
    router.push({
      name: "editionInfo",
      params: {
        editionId: edition.value?.id,
      },
    });
  }

  return {
    navigateToTocEntry,
    selectEdition,
    editionInfo,
  };
}

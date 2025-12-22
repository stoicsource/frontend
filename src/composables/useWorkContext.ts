import { computed, type ComputedRef } from "vue";
import type { Work } from "@/models/Work";
import type { Edition } from "@/models/Edition";
import type { TocEntry } from "@/models/TocEntry";
import { useWorksStore } from "@/stores/works";
import { useSelectionStore } from "@/stores/selection";
import { EDITION_QUALITY_THRESHOLD } from "@/constants";

interface WorkContextProps {
  workSlug: string;
  tocSlug?: string;
  translatorSlug?: string;
}

interface WorkContextReturn {
  work: ComputedRef<Work | undefined>;
  edition: ComputedRef<Edition | null | undefined>;
  tocEntry: ComputedRef<TocEntry | null | undefined>;
  sortedEditions: ComputedRef<Edition[]>;
  sortedTocEntries: ComputedRef<TocEntry[]>;
}

/**
 * Composable for managing work, edition, and TOC entry context
 * Handles selection logic and sorting
 */
export function useWorkContext(
  props: WorkContextProps
): WorkContextReturn {
  const worksStore = useWorksStore();
  const selectionStore = useSelectionStore();

  const work = computed(() => {
    const workFromStore = worksStore.works.find((work: Work) => {
      return work.urlSlug === props.workSlug;
    });
    worksStore.loadFullWork(workFromStore?.id ?? -1);
    return workFromStore;
  });

  // Set active work for navbar display
  worksStore.activeWork = work.value !== undefined ? work.value : null;

  const edition = computed(() => {
    if (!work.value || !work.value.editions) {
      return null;
    }

    if (props.translatorSlug) {
      return work.value.editions?.find((edition) => {
        return edition.author?.urlSlug === props.translatorSlug;
      });
    }

    const selectionInfo = selectionStore.getSelectionInfo(work.value.id);
    const selectedEdition =
      selectionInfo.editionIds.length > 0
        ? work.value.editions.find((edition) => {
            return edition.id === selectionInfo.editionIds[0];
          })
        : null;

    return selectedEdition ?? work.value.editions[0];
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

  const sortedEditions = computed(() => {
    if (!work.value || !work.value.editions) {
      return [];
    }

    return work.value.editions
      .filter((edition) => {
        return edition.quality >= EDITION_QUALITY_THRESHOLD;
      })
      .sort((a: Edition, b: Edition) => {
        return a.year > b.year ? 1 : -1;
      });
  });

  const sortedTocEntries = computed(() => {
    if (!work.value || !work.value.tocEntries) {
      return [];
    }

    return work.value.tocEntries.sort((a: TocEntry, b: TocEntry) => {
      return a.sortOrder > b.sortOrder ? 1 : -1;
    });
  });

  return {
    work,
    edition,
    tocEntry,
    sortedEditions,
    sortedTocEntries,
  };
}

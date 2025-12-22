import { ref } from "vue";
import { defineStore } from "pinia";
import { SelectionInfo } from "@/models/SelectionInfo";
import { useWorksStore } from "@/stores/works";
import { TocEntry } from "@/models/TocEntry";

export const useSelectionStore = defineStore("selection", () => {
  const worksStore = useWorksStore();

  const selectionInfos = ref<SelectionInfo[]>([]);

  function getSelectionInfo(workId: number): SelectionInfo {
    const work = worksStore.works.find((work) => {
      return work.id === workId;
    });
    if (!work || !work.editions || !work.tocEntries) {
      return new SelectionInfo();
    }

    let selectionInfo = selectionInfos.value.find((selectionInfo) => {
      return selectionInfo.workId === workId;
    });

    if (!selectionInfo) {
      selectionInfo = new SelectionInfo();
      selectionInfo.workId = workId;
      selectionInfos.value.push(selectionInfo);
    }

    if (!selectionInfo.tocEntryIds) {
      const firstEntry = work.tocEntries[0];
      selectionInfo.tocEntryIds =
        firstEntry ? [firstEntry.id] : [];
    }

    if (!selectionInfo.editionIds) {
      const editions = work.editions
        .filter((edition) => {
          return edition.language === "eng";
        })
        .sort((a, b) => {
          return a.year > b.year ? 1 : -1;
        });
      const firstEdition = editions[0];
      selectionInfo.editionIds = firstEdition ? [firstEdition.id] : [];
    }

    return selectionInfo;
  }

  function saveToLocalStorage() {
    localStorage.selectionInfo = JSON.stringify(selectionInfos.value);
  }

  function loadFromLocalStorage() {
    if (localStorage.selectionInfo) {
      const rawData = JSON.parse(localStorage.selectionInfo);
      if (Array.isArray(rawData)) {
        selectionInfos.value = rawData.map((rawInfo) => {
          return Object.assign(new SelectionInfo(), rawInfo);
        });
      }
    }
  }

  return { getSelectionInfo, saveToLocalStorage, loadFromLocalStorage };
});

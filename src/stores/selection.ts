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
      selectionInfo.tocEntryIds =
        work.tocEntries.length > 0 ? [work.tocEntries[0].id] : [];
    }

    if (!selectionInfo.editionIds) {
      const editions = work.editions
        .filter((edition) => {
          return edition.language === "eng";
        })
        .sort((a, b) => {
          return a.year > b.year ? 1 : -1;
        });
      selectionInfo.editionIds = editions ? [editions[0].id] : [];
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

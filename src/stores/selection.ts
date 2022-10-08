import { ref } from "vue";
import { defineStore } from "pinia";
import { SelectionInfo } from "@/models/SelectionInfo";
import { useWorksStore } from "@/stores/works";

export const useSelectionStore = defineStore("selection", () => {
  const worksStore = useWorksStore();

  const selectionInfos = ref<SelectionInfo[]>([]);

  function getSelectionInfo(workId: number) {
    const work = worksStore.works.find((work) => {
      return work.id === workId;
    });
    if (!work || !work.editions || !work.tocEntries) {
      return null;
    }

    let selectionInfo = selectionInfos.value.find((selectionInfo) => {
      return selectionInfo.workId === workId;
    });

    if (!selectionInfo) {
      selectionInfo = new SelectionInfo();
      selectionInfo.workId = workId;

      selectionInfo.tocEntries =
        work.tocEntries.length > 0 ? [work.tocEntries[0].id] : [];

      const editions = work.editions
        .filter((edition) => {
          return edition.language === "eng";
        })
        .sort((a, b) => {
          return a.year > b.year ? 1 : -1;
        });

      selectionInfo.editions = editions ? [editions[0].id] : [];

      selectionInfos.value.push(selectionInfo);
    }

    return selectionInfo;
  }

  function saveToLocalStorage() {
    localStorage.selectionInfo = JSON.stringify(selectionInfos.value);
  }

  function loadFromLocalStorage() {
    if (localStorage.selectionInfo) {
      selectionInfos.value = JSON.parse(localStorage.selectionInfo);
    }
  }

  return { getSelectionInfo, saveToLocalStorage, loadFromLocalStorage };
});

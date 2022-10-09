import { ref } from "vue";
import { defineStore } from "pinia";
import type { TocEntry } from "@/models/TocEntry";
import type { Edition } from "@/models/Edition";
import { Chapter } from "@/models/Chapter";
import { useWorksStore } from "@/stores/works";
import StoreUtils from "@/utils/store/StoreUtils";
import api from "@/utils/api";

export const useChaptersStore = defineStore("chapters", () => {
  const worksStore = useWorksStore();

  const entryPadding = 1;
  let lastRequestParamString: String | null = null;

  const chapters = ref<Chapter[]>([]);

  const chaptersLoading = ref(false);

  function chapterFromResponse(chapterData: any): Chapter {
    const tocEntryId = StoreUtils.extractIdFromJsonUrl(chapterData.tocEntry);
    const editionId = StoreUtils.extractIdFromJsonUrl(chapterData.edition);

    const newChapter = Object.assign(new Chapter(), chapterData);

    const work = worksStore.getWorkByEdition(editionId);
    if (
      !work ||
      !work.tocEntries ||
      work.tocEntries.length === 0 ||
      !work.editions ||
      work.editions.length === 0
    ) {
      throw "Work not completely loaded";
    }

    newChapter.edition = work?.editions?.find((edition) => {
      return edition.id === editionId;
    });
    newChapter.tocEntry = work?.tocEntries?.find((tocEntry) => {
      return tocEntry.id === tocEntryId;
    });

    return newChapter;
  }

  function requireContent(tocEntry: TocEntry, edition: Edition) {
    const requiredEntries = [tocEntry];

    if (entryPadding === 1) {
      if (tocEntry.previous) {
        requiredEntries.push(tocEntry.previous);
      }
      if (tocEntry.next) {
        requiredEntries.push(tocEntry.next);
      }
    }

    const tocIdsToLoad: number[] = [];
    requiredEntries.forEach(function (tocEntry) {
      const alreadyLoaded = chapters.value.some((chapter) => {
        return (
          chapter.tocEntry?.id === tocEntry.id &&
          chapter.edition?.id === edition.id
        );
      });

      if (!alreadyLoaded) {
        tocIdsToLoad.push(tocEntry.id);
      }
    });

    if (tocIdsToLoad.length > 0) {
      const tocParams = tocIdsToLoad.map(
        (tocEntryId) => "tocEntry[]=" + tocEntryId
      );
      const editionParams = ["edition[]=" + edition.id];

      const paramString = editionParams.join("&") + "&" + tocParams.join("&");

      if (paramString !== lastRequestParamString) {
        lastRequestParamString = paramString;

        return api.get("/contents?" + paramString).then((chapterResponse) => {
          const chapterArray: Chapter[] = [];

          chapterResponse.data.forEach((chapterData: any) => {
            const newChapter = chapterFromResponse(chapterData);
            chapterArray.push(newChapter);
          });

          if (chapterArray.length > 0) {
            chapters.value = chapters.value.concat(chapterArray);
          }
        });
      } else {
        return Promise.reject();
      }
    }

    return Promise.resolve();
  }

  function isContentItemLoaded(tocEntry: TocEntry, edition: Edition) {
    return chapters.value.some((chapter) => {
      return (
        chapter.tocEntry?.id === tocEntry.id &&
        chapter.edition?.id === edition.id
      );
    });
  }

  function getContentItem(tocEntry: TocEntry, edition: Edition) {
    return chapters.value.find((chapter) => {
      return (
        chapter.tocEntry?.id === tocEntry.id &&
        chapter.edition?.id === edition.id
      );
    });
  }

  function getRandomItem(): Promise<Chapter> {
    return api
      .get("/contents?order[random]&itemsPerPage=1&cachebuster=" + Date.now())
      .then(function (response) {
        const chapterData = response.data[0];
        const editionId = StoreUtils.extractIdFromJsonUrl(chapterData.edition);
        const work = worksStore.getWorkByEdition(editionId);

        if (work && !work.tocLoaded()) {
          return worksStore.loadFullWork(work.id).then(() => {
            return chapterFromResponse(chapterData);
          });
        } else {
          return Promise.resolve(chapterFromResponse(chapterData));
        }
      });
  }

  return {
    chaptersLoading,
    requireContent,
    isContentItemLoaded,
    getContentItem,
    getRandomItem,
  };
});

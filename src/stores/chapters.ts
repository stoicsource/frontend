import { ref } from "vue";
import { defineStore } from "pinia";
import type { TocEntry } from "@/models/TocEntry";
import type { Edition } from "@/models/Edition";
import type { Chapter } from "@/models/Chapter";
import axios from "axios";

export const useChaptersStore = defineStore("chapters", () => {
  const entryPadding = 1;
  let lastRequestParamString: String | null = null;

  const chapters = ref<Chapter[]>([]);

  const axiosInstance = axios.create({
    headers: {
      Accept: "application/json",
    },
  });

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

        return axiosInstance.get(
          import.meta.env.VITE_APP_API_URL + "/contents?" + paramString
        );
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

  function getRandomItem() {
    return axiosInstance
      .get(
        import.meta.env.VITE_APP_API_URL +
          "/contents?order[random]&itemsPerPage=1&cachebuster=" +
          Date.now()
      )
      .then(function (response) {
        return response.data.entities.contents[0];
      });
  }

  function ensureDependencies(chapter: Chapter) {
    throw 'ensureDependencies not yet implemeted';
    // const edition = Edition.query()
    //   .whereId(chapter.edition_id)
    //   .with("work")
    //   .first();
    // const workLoaded = WorkService.workFullyLoaded(edition?.work);
    // return workLoaded
    //   ? Promise.resolve()
    //   : WorkService.loadFullWork(edition.work);
  }

  return {
    requireContent,
    isContentItemLoaded,
    getContentItem,
    getRandomItem,
    ensureDependencies,
  };
});

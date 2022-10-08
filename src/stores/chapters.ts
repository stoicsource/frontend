import { ref } from "vue";
import { defineStore } from "pinia";
import type { TocEntry } from "@/models/TocEntry";
import type { Edition } from "@/models/Edition";
import { Chapter } from "@/models/Chapter";
import { useWorksStore } from "@/stores/works";
import type { Work } from "@/models/Work";
import StoreUtils from "@/utils/store/StoreUtils";
import api from "@/utils/api";

export const useChaptersStore = defineStore("chapters", () => {
  const worksStore = useWorksStore();

  const entryPadding = 1;
  let lastRequestParamString: String | null = null;

  const chapters = ref<Chapter[]>([]);

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
          let work: Work | undefined = undefined;
          chapterResponse.data.forEach((chapterData: any) => {
            const tocEntryId = StoreUtils.extractIdFromJsonUrl(
              chapterData.tocEntry
            );
            const editionId = StoreUtils.extractIdFromJsonUrl(
              chapterData.edition
            );

            const newChapter = Object.assign(new Chapter(), chapterData);
            if (!work) {
              work = worksStore.works.find((work) => {
                return work.editions?.some((edition) => {
                  return edition.id === editionId;
                });
              });
            }

            newChapter.edition = work?.editions?.find((edition) => {
              return edition.id === editionId;
            });
            newChapter.tocEntry = work?.tocEntries?.find((tocEntry) => {
              return tocEntry.id === tocEntryId;
            });

            chapterArray.push(newChapter);
          });

          chapters.value = chapters.value.concat(chapterArray);
        });
        // TODO: remove the response processing to investigate infinite loop
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
    return api
      .get("/contents?order[random]&itemsPerPage=1&cachebuster=" + Date.now())
      .then(function (response) {
        return response.data.entities.contents[0];
      });
  }

  function ensureDependencies(chapter: Chapter) {
    throw "ensureDependencies not yet implemented";
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

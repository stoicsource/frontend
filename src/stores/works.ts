import { ref } from "vue";
import { defineStore } from "pinia";
import { Author } from "@/models/Author";
import { Work } from "@/models/Work";
import StoreUtils from "@/utils/store/StoreUtils";
import { Edition } from "@/models/Edition";
import { TocEntry } from "@/models/TocEntry";
import api from "@/utils/api";
import { useGeneralStore } from "@/stores/general";
import type {
  AuthorApiResponse,
  EditionApiResponse,
  WorkApiResponse,
  TocEntryApiResponse,
} from "@/types/api";

export const useWorksStore = defineStore("works", () => {
  const generalStore = useGeneralStore();
  generalStore.globalLoading = true;

  const activeWork = ref<Work | null>(null);

  const works = ref<Work[]>([]);

  const authorsRequest = api.get("/authors");
  const worksRequest = api.get("/works");
  const editionsRequest = api.get("/editions");

  Promise.all([authorsRequest, worksRequest, editionsRequest])
    .then(([authorsResponse, worksResponse, editionsResponse]) => {
      const authorArray: Author[] = [];
      authorsResponse.data.forEach((authorData: AuthorApiResponse) => {
        authorArray.push(Object.assign(new Author(), authorData));
      });

      const editionArray: Edition[] = [];
      editionsResponse.data.forEach((editionData: EditionApiResponse) => {
        const { author, ...editionProps } = editionData;
        const newEdition = Object.assign(new Edition(), editionProps);

        const authorId = StoreUtils.extractIdFromJsonUrl(author);
        newEdition.author = authorArray.find((a: Author) => a.id === authorId);

        editionArray.push(newEdition);
      });

      const workArray: Work[] = [];
      worksResponse.data.forEach((workData: WorkApiResponse) => {
        const { author, editions, ...workProps } = workData;
        const newWork = Object.assign(new Work(), workProps);

        const authorId = StoreUtils.extractIdFromJsonUrl(author);
        newWork.author = authorArray.find((a: Author) => a.id === authorId);

        const workEditions = editions
          .map((url: string) => {
            const editionId = StoreUtils.extractIdFromJsonUrl(url);
            return editionArray.find((e: Edition) => e.id === editionId);
          })
          .filter((e): e is Edition => e !== undefined);

        newWork.editions = workEditions;
        newWork.tocEntries = undefined;

        workArray.push(newWork);
      });

      works.value = workArray;
    })
    .finally(() => {
      generalStore.globalLoading = false;
    });

  function loadFullWork(workId: number): Promise<any> {
    const work = works.value.find((work: Work) => {
      return work.id === workId;
    });

    if (work && !work.tocLoaded()) {
      return api.get("/toc_entries?work=" + work.id).then((tocResponse) => {
        let tocEntryArray: TocEntry[] = [];
        tocResponse.data.forEach((tocEntryData: TocEntryApiResponse) => {
          tocEntryArray.push(Object.assign(new TocEntry(), tocEntryData));
        });
        tocEntryArray = tocEntryArray.sort((a, b) => {
          return a.sortOrder > b.sortOrder ? 1 : -1;
        });

        for (let i = 0; i < tocEntryArray.length; i++) {
          const entryAtIndex = tocEntryArray[i];
          if (entryAtIndex) {
            if (i > 0) {
              entryAtIndex.previous = tocEntryArray[i - 1] || null;
            }
            if (i < tocEntryArray.length - 1) {
              entryAtIndex.next = tocEntryArray[i + 1] || null;
            }
          }
        }

        work.tocEntries = tocEntryArray;
      });
    }

    return Promise.resolve();
  }

  function getWorkByEdition(editionId: number) {
    return works.value.find((work) => {
      return work.editions?.some((edition) => {
        return edition.id === editionId;
      });
    });
  }

  function getRandomWork() {
    return works.value[Math.floor(Math.random() * works.value.length)];
  }

  /**
   * Get random work with random chapter for navigation
   * Loads the work's TOC if needed and returns navigation params
   */
  async function getRandomChapterNavigation(): Promise<{
    work: Work;
    tocLabel: string;
  } | null> {
    const randomWork = getRandomWork();
    if (!randomWork) {
      return null;
    }

    await loadFullWork(randomWork.id);

    if (!randomWork.tocEntries || randomWork.tocEntries.length === 0) {
      return null;
    }

    const randomTocEntry =
      randomWork.tocEntries[
        Math.floor(Math.random() * randomWork.tocEntries.length)
      ];

    if (!randomTocEntry) {
      return null;
    }

    return {
      work: randomWork,
      tocLabel: randomTocEntry.label,
    };
  }

  return {
    works,
    activeWork,
    loadFullWork,
    getWorkByEdition,
    getRandomWork,
    getRandomChapterNavigation,
  };
});

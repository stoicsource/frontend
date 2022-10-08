import { ref } from "vue";
import { defineStore } from "pinia";
import { Author } from "@/models/Author";
import { Work } from "@/models/Work";
import StoreUtils from "@/utils/store/StoreUtils";
import { Edition } from "@/models/Edition";
import { TocEntry } from "@/models/TocEntry";
import api from "@/utils/api";
import { useGeneralStore } from "@/stores/general";

export const useWorksStore = defineStore("works", () => {
  const generalStore = useGeneralStore();
  generalStore.loading = true;

  const activeWork = ref<Work | null>(null);

  const works = ref<Work[]>([]);

  const authorsRequest = api.get("/authors");
  const worksRequest = api.get("/works");
  const editionsRequest = api.get("/editions");

  Promise.all([authorsRequest, worksRequest, editionsRequest])
    .then(([authorsResponse, worksResponse, editionsResponse]) => {
      const authorArray: Author[] = [];
      authorsResponse.data.forEach((authorData: any) => {
        authorArray.push(Object.assign(new Author(), authorData));
      });

      const editionArray: Edition[] = [];
      editionsResponse.data.forEach((editionData: any) => {
        const newEdition = Object.assign(new Edition(), editionData);

        const authorId = StoreUtils.extractIdFromJsonUrl(editionData.author);
        newEdition.author = authorArray.find((author: Author) => {
          return author.id === authorId;
        });

        editionArray.push(newEdition);
      });

      const workArray: Work[] = [];
      worksResponse.data.forEach((workData: any) => {
        const newWork = Object.assign(new Work(), workData);

        const authorId = StoreUtils.extractIdFromJsonUrl(workData.author);
        newWork.author = authorArray.find((author: Author) => {
          return author.id === authorId;
        });

        const workEditions: Edition[] = [];
        workData.editions.forEach((workEditionIdUrl: string) => {
          const editionId = StoreUtils.extractIdFromJsonUrl(workEditionIdUrl);
          const workEdition = editionArray.find((edition: Edition) => {
            return edition.id === editionId;
          });
          if (workEdition) {
            workEditions.push(workEdition);
          }
        });
        newWork.editions = workEditions;
        newWork.tocEntries = undefined;

        workArray.push(newWork);
      });

      works.value = workArray;
    })
    .finally(() => {
      generalStore.loading = false;
    });

  function loadFullWork(workId: number): Promise<any> {
    const work = works.value.find((work: Work) => {
      return work.id === workId;
    });

    if (work && !work.tocLoaded()) {
      return api.get("/toc_entries?work=" + work.id).then((tocResponse) => {
        let tocEntryArray: TocEntry[] = [];
        tocResponse.data.forEach((tocEntryData: any) => {
          tocEntryArray.push(Object.assign(new TocEntry(), tocEntryData));
        });
        tocEntryArray = tocEntryArray.sort((a, b) => {
          return a.sortOrder > b.sortOrder ? 1 : -1;
        });

        for (let i = 0; i < tocEntryArray.length; i++) {
          const entryAtIndex = tocEntryArray[i];
          if (i > 0) {
            entryAtIndex.previous = tocEntryArray[i - 1];
          }
          if (i < tocEntryArray.length - 1) {
            entryAtIndex.next = tocEntryArray[i + 1];
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

  return { works, activeWork, loadFullWork, getWorkByEdition };
});

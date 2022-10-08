import { ref } from "vue";
import { defineStore } from "pinia";
import axios from "axios";
import { Author } from "@/models/Author";
import { Work } from "@/models/Work";
import StoreUtils from "@/utils/store/StoreUtils";
import { Edition } from "@/models/Edition";

export const useWorksStore = defineStore("works", () => {
  const activeWork: Work | null = null;

  const works = ref<Work[]>([]);

  const axiosInstance = axios.create({
    headers: {
      Accept: "application/json",
    },
  });

  const authorsRequest = axiosInstance.get(
    import.meta.env.VITE_APP_API_URL + "/authors"
  );
  const worksRequest = axiosInstance.get(
    import.meta.env.VITE_APP_API_URL + "/works"
  );
  const editionsRequest = axiosInstance.get(
    import.meta.env.VITE_APP_API_URL + "/editions"
  );

  Promise.all([authorsRequest, worksRequest, editionsRequest]).then(
    ([authorsResponse, worksResponse, editionsResponse]) => {
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

        workArray.push(newWork);
      });

      works.value = workArray;
    }
  );

  function getWorkDetails(workId: number) {
    return works.value.find((work: Work) => {
      return work.id === workId;
    });
  }

  return { works, activeWork, getWorkDetails };
});

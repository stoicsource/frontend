import { ref } from "vue";
import { defineStore } from "pinia";
import axios from "axios";
import { Author } from "@/models/Author";
import { Work } from "@/models/Work";
import StoreUtils from "@/utils/store/StoreUtils";

export const worksStore = defineStore("works", () => {
  const works = ref<Work[]>([]);

  const axiosInstance = axios.create({
    headers: {
      Accept: "application/json",
    },
  });

  const authorsRequest = axiosInstance.get(
    "https://127.0.0.1:8000/api/v2/authors"
  );
  const worksRequest = axiosInstance.get("https://127.0.0.1:8000/api/v2/works");

  Promise.all([authorsRequest, worksRequest]).then(
    ([authorsResponse, worksResponse]) => {
      const authorArray: Author[] = [];
      authorsResponse.data.forEach((authorData: any) => {
        authorArray.push(Object.assign(new Author(), authorData));
      });

      const workArray: Work[] = [];
      worksResponse.data.forEach((workData: any) => {
        const newWork = Object.assign(new Work(), workData);

        const authorId = StoreUtils.extractIdFromJsonUrl(workData.author);
        newWork.author = authorArray.find((author: Author) => {
          return author.id === authorId;
        });

        workArray.push(newWork);
      });

      works.value = workArray;
    }
  );

  return { works };
});

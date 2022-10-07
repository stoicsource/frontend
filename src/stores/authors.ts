import { ref } from "vue";
import { defineStore } from "pinia";
import axios from "axios";
import { Author } from "@/models/Author";

export const authorsStore = defineStore("authors", () => {
  const authors = ref<Author[]>([]);

  const reqInstance = axios.create({
    headers: {
      Accept: "application/json",
    },
  });

  reqInstance.get("https://127.0.0.1:8000/api/v2/authors").then((response) => {
    const authorArray: Author[] = [];
    response.data.forEach((authorData: any) => {
      // authorArray.push(authorData as Author);

      authorArray.push(Object.assign(new Author(), authorData));
    });

    authors.value = authorArray;
  });

  return { authors };
});

import { ref } from "vue";
import { defineStore } from "pinia";

export const useGeneralStore = defineStore("general", () => {
  const loading = ref(false);

  return { loading };
});

import { ref } from "vue";
import { defineStore } from "pinia";

export const useGeneralStore = defineStore("general", () => {
  const globalLoading = ref(false);

  return { globalLoading: globalLoading };
});

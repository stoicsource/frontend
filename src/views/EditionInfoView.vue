<script setup lang="ts">
import { computed } from "vue";
import { useWorksStore } from "@/stores/works";

const props = defineProps<{
  editionId: number | string;
}>();

const worksStore = useWorksStore();

const edition = computed(() => {
  const editionId = parseInt(props.editionId as string);
  const work = worksStore.getWorkByEdition(editionId);
  return work?.editions?.find((edition) => {
    return edition.id === editionId;
  });
});
</script>

<template>
  <div v-if="edition" class="container-fluid mt-2 position-relative">
    <div class="position-absolute top-0 end-0 me-2">
      <a @click="$router.go(-1)">
        <i class="fa-solid fa-xmark fa-2xl text-secondary"></i>
      </a>
    </div>

    <h1>{{ edition.name }}</h1>
    <p>
      published in {{ edition.year }}, translated by
      <span v-if="edition.author.moreInfoUrl"
        ><a :href="edition.author.moreInfoUrl" target="_blank">{{
          edition.author.name
        }}</a></span
      >
      <span v-else>{{ edition.author.name }}</span>

      <span v-if="edition.author.yearsAlive || edition.author.summary">
        (<span v-if="edition.author.yearsAlive">{{
          edition.author.yearsAlive
        }}</span>
        <span v-if="edition.author.summary">, {{ edition.author.summary }}</span
        >)
      </span>
    </p>
    <div v-if="edition.sources" class="mb-4">
      Sources:
      <div v-for="source in edition.sources" :key="source.url">
        <a :href="source.url" target="_blank">{{ source.type }}</a>&nbsp;
        <i class="fa-solid fa-arrow-up-right-from-square"></i>
      </div>
    </div>
    <p v-if="edition.contributor">
      contributed to StoicSource by <br />
      {{ edition.contributor.name }} (<a
        :href="'mailto:' + edition.contributor.email"
        >mail</a
      >
      | <a :href="edition.contributor.website" target="_blank">web</a> )
    </p>
  </div>
</template>

<style scoped>
h1 {
  font-size: 1.1em;
}
</style>

<script setup lang="ts">
import { computed } from "vue";
import { useWorksStore } from "@/stores/works";
import type { Work } from "@/models/Work";

const props = defineProps<{
  authorSlug: string;
}>();

const store = useWorksStore();
store.activeWork = null;

const sortedWorks = computed(() => {
  return store.works
    .filter((work: Work) => {
      return work.author?.urlSlug === props.authorSlug;
    })
    .sort((a: Work, b: Work) => {
      return a.name > b.name ? 1 : -1;
    });
});

const workAuthor = computed(() => {
  return sortedWorks.value.length > 0 ? sortedWorks.value[0].author : null;
});
</script>

<template>
  <div class="container work-list" v-if="workAuthor">
    <div class="author-name">{{ workAuthor.shortestName() }}</div>

    <ul class="list-group">
      <li class="list-group-item" v-for="work in sortedWorks" :key="work.id">
        <router-link
          :to="'/' + workAuthor.urlSlug + '/' + work.urlSlug"
          class="plain-link"
        >
          {{ work.name }}
        </router-link>
      </li>
    </ul>
  </div>
</template>

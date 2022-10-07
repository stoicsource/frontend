<script setup lang="ts">
import { computed } from 'vue'
import { authorsStore } from "@/stores/authors";

const store = authorsStore();
const authors = computed(() => {
  return store.authors.filter((author) => { return author.works.length > 0; });
})

function navigateToAuthor(author: String) {
  console.log(author);
}

</script>

<template>
  <div class="container author-list">
    <div class="card mt-2" v-for="author in authors" :key="author.id">
      <div class="card-body">
        <h4 class="card-title">{{ author.shortestName() }}</h4>

        <p class="card-text">
          <span v-if="author.works.length === 1">
            {{ author.works[0].name }}
          </span>
          <span v-else> {{ author.works.length }} works available </span>
        </p>

        <a @click="navigateToAuthor(author)" class="stretched-link"></a>
      </div>
    </div>
  </div>
</template>

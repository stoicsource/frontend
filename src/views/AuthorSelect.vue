<script setup lang="ts">
import { computed } from "vue";
import { worksStore } from "@/stores/works";
import { Author } from "@/models/Author";
import { Work } from "@/models/Work";

const store = worksStore();

const authorList = computed(() => {
  let uniqueAuthors: Author[] = [];
  store.works.forEach((work: Work) => {
    if (
      !uniqueAuthors.find((author: Author) => {
        return author.id === work.author.id;
      })
    ) {
      uniqueAuthors.push(work.author);
    }
  });
  uniqueAuthors = uniqueAuthors.sort((a: Author, b: Author) => {
    return a.shortestName() > b.shortestName() ? 1 : -1;
  });

  const randomAuthor = new Author();
  randomAuthor.id = -1;
  randomAuthor.name = "Random";
  uniqueAuthors.push(randomAuthor);

  return uniqueAuthors;
});

function authorWorks(author: Author) {
  if (author.id === -1) {
    return [
      {
        name: "Let fate decide where to take you",
      },
    ];
  }
  return store.works.filter((work: Work) => {
    return work.author.id === author.id;
  });
}

function navigateToAuthor(author: Author) {
  console.log(author);
}
</script>

<template>
  <div class="container author-list">
    <div class="card mt-2" v-for="author in authorList" :key="author.id">
      <div class="card-body">
        <h4 class="card-title">{{ author.shortestName() }}</h4>

        <p class="card-text">
          <span v-if="authorWorks(author).length === 1">
            {{ authorWorks(author)[0].name }}
          </span>
          <span v-else> {{ authorWorks(author).length }} works available </span>
        </p>

        <a @click="navigateToAuthor(author)" class="stretched-link"></a>
      </div>
    </div>
  </div>
</template>

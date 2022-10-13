<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useWorksStore } from "@/stores/works";
import { Author } from "@/models/Author";
import { Work } from "@/models/Work";
import { useGeneralStore } from "@/stores/general";
import { useChaptersStore } from "@/stores/chapters";
import type { Chapter } from "@/models/Chapter";

const worksStore = useWorksStore();
worksStore.activeWork = null;

const generalStore = useGeneralStore();
const chaptersStore = useChaptersStore();
const router = useRouter();

const authorList = computed(() => {
  let uniqueAuthors: Author[] = [];
  worksStore.works.forEach((work: Work) => {
    if (
      work.author &&
      !uniqueAuthors.find((author: Author) => {
        return author.id === work.author?.id;
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

function authorWorks(author: Author): Work[] {
  if (author.id === -1) {
    let fakeWork = new Work();
    fakeWork.name = "Let fate decide where to take you";
    return [fakeWork];
  }
  return worksStore.works.filter((work: Work) => {
    return work.author?.id === author.id;
  });
}

function navigateToAuthor(author: Author) {
  if (author.id === -1) {
    generalStore.globalLoading = true;
    chaptersStore
      .getRandomChapter()
      .then(function (randomChapter: Chapter) {
        generalStore.globalLoading = false;

        const work = worksStore.getWorkByEdition(
          randomChapter.edition?.id ?? -1
        );
        if (work) {
          router.push({
            name: "contentByToc",
            params: {
              author: work.author?.urlSlug,
              workSlug: work.urlSlug,
              tocSlug: randomChapter.tocEntry?.label,
            },
          });
        }
      })
      .catch(function () {
        generalStore.globalLoading = false;
      });
  } else {
    const works = authorWorks(author);
    if (works.length === 1) {
      router.push("/" + author.urlSlug + "/" + works[0].urlSlug);
    } else {
      router.push("/" + author.urlSlug + "/works");
    }
  }
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

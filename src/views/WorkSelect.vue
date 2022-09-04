<template>
  <div class="container work-list" v-if="workAuthor">
    <div class="author-name">{{ workAuthor.shortestName }}</div>

    <ul class="list-group">
      <li class="list-group-item" v-for="work in sortedWorks(workAuthor.works)" :key="work.id">
        <router-link :to="'/' + workAuthor.urlSlug + '/' + work.urlSlug" class="plain-link">
          {{ work.name }}
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
import Author from "@/store/models/Author";
import Work from "@/store/models/Work";
import {mapMutations} from "vuex";

export default {
  props: ['author'],
  mounted () {
    this.setActiveWork(null);
  },
  computed: {
    workAuthor () {
      return Author.query().where('urlSlug', this.author).withAllRecursive().first();
    }
  },
  methods: {
    ...mapMutations('app', ['setActiveWork']),

    sortedWorks (works) {
      return Work.query().whereIdIn(works.map((work) => work.id)).orderBy('name').withAllRecursive().all();
    }
  }
}
</script>

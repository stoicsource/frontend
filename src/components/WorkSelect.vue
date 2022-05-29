<template>
  <div class="container work-list" v-if="workAuthor">
    <div class="author-name">{{ workAuthor.shortestName }}</div>

    <ul class="list-group">
      <li class="list-group-item" v-for="work in sortedWorks(workAuthor.works)" :key="work.id">
        <router-link :to="'/' + workAuthor.url_slug + '/' + work.url_slug" class="plain-link">
          {{ work.name }}
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
import orderBy from 'lodash.orderby';
import Author from "@/store/models/Author";

export default {
  props: ['author'],
  components: {},
  data () {
    return {}
  },
  computed: {
    workAuthor () {
      return Author.query().where('url_slug', this.author).withAllRecursive().first();
    }
  },
  methods: {
    sortedWorks (works) {
      return orderBy(works, 'name');
    }
  }
}
</script>

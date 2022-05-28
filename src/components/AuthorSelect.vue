<template>
  <div class="container author-list">
    <div class="card mt-2" v-for="workAuthor in workAuthors" :key="workAuthor.id">
      <div class="card-body">


        <h4 class="card-title">{{ workAuthor.shortestName }}</h4>

        <p class="card-text">
        <span v-if="workAuthor.works.length === 1">
          {{ workAuthor.works[0].name }}
        </span>
          <span v-else>
          {{ workAuthor.works.length }} works available
        </span>
        </p>

        <router-link v-if="workAuthor.works.length === 1" :to="'/' + workAuthor.url_slug + '/' + workAuthor.works[0].url_slug" class="stretched-link"></router-link>
        <router-link v-else :to="'/' + workAuthor.url_slug + '/works'" class="stretched-link"></router-link>
      </div>
    </div>
  </div>
</template>

<script>
import orderBy from 'lodash.orderby';
import Author from "@/store/models/Author";

export default {
  components: {},
  data () {
    return {}
  },
  computed: {
    workAuthors () {
      return Author.query().has('works').withAllRecursive().orderBy('shortestName').all();
    }
  },
  methods: {
    sortedWorks (works) {
      return orderBy(works, 'name');
    }
  }
}
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style lang="scss" scoped>

</style>
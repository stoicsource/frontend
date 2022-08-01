<template>
  <div class="container author-list">
    <div class="card mt-2" v-for="author in authors" :key="author.id">
      <div class="card-body">
        <h4 class="card-title">{{ author.shortestName }}</h4>

        <p class="card-text">
          <span v-if="author.works.length === 1">
            {{ author.works[0].name }}
          </span>
          <span v-else>
            {{ author.works.length }} works available
          </span>
        </p>

        <router-link v-if="author.works.length === 1" :to="'/' + author.urlSlug + '/' + author.works[0].urlSlug" class="stretched-link"></router-link>
        <router-link v-else :to="'/' + author.urlSlug + '/works'" class="stretched-link"></router-link>
      </div>
    </div>
  </div>
</template>

<script>
import Author from "@/store/models/Author";

export default {
  data () {
    return {}
  },
  computed: {
    authors () {
      return Author.query().has('works').withAllRecursive().orderBy('shortestName').all();
    }
  },
  methods: {

  }
}
</script>

<template>
  <div class="author-list">

    <b-card v-for="workAuthor in workAuthors" :key="workAuthor.id" class="mt-2">
      <b-card-title>{{ workAuthor.shortestName }}</b-card-title>
      <b-card-text>
        <span v-if="workAuthor.works.length === 1">
          {{ workAuthor.works[0].name }}
        </span>
        <span v-else>
          {{ workAuthor.works.length }} works available
        </span>
      </b-card-text>
      <router-link v-if="workAuthor.works.length === 1" :to="'/' + workAuthor.works[0].url_slug" class="stretched-link"></router-link>
      <router-link v-else :to="'/' + workAuthor.url_slug + '/works'" class="stretched-link"></router-link>
    </b-card>
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
    },

    selectWork (work) {
      this.$emit('work-selected', work);
    }
  }
}
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style lang="scss" scoped>

.author-list {
  // margin-top: -1em;
  .card {
    img {
      max-width: 20vw;
    }
  }
}

.author-name {
  color: #666;
}
</style>
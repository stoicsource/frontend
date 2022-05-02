<template>
  <div class="container work-list" v-if="workAuthor">
    <div class="author-name">{{ workAuthor.shortestName }}</div>

    <b-list-group>
      <b-list-group-item v-for="work in sortedWorks(workAuthor.works)" :key="work.id" :to="'/' + workAuthor.url_slug + '/' + work.url_slug">{{ work.name }}</b-list-group-item>
    </b-list-group>
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
    },

    selectWork (work) {
      this.$emit('work-selected', work);
    }
  }
}
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style lang="scss" scoped>

</style>
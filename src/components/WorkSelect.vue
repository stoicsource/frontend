<template>
  <div class="work-list">
    <div v-for="workAuthor in workAuthors" :key="workAuthor.id" class="mt-3">
      <div class="author-name">{{ workAuthor.shortestName }}</div>
      <b-button v-for="work in sortedWorks(workAuthor.works)" :key="work.id" @click="selectWork(work)" variant="outline-primary">
        {{ work.name }}
      </b-button>
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
    },

    selectWork (work) {
      this.$emit('work-selected', work);
    }
  }
}
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style lang="scss" scoped>

.author-name {
  color: #666;
}
</style>
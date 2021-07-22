<template>
  <div class="work-list">
    <div v-for="workAuthor in workAuthors" :key="workAuthor.id" class="mt-3">
      <span class="author-name">{{ workAuthor.shortestName }}</span>

      <div class="accordion mt-1 d-lg-block" role="tablist">
        <work v-for="work in sortedWorks(workAuthor.works)" :key="work.id" :work-id="work.id" v-on:update-selected-work="emitUpdate"></work>
      </div>
    </div>

  </div>
</template>

<script>
import _ from 'lodash'
import Author from "@/store/models/Author";
import Work from "@/components/Work";

export default {
  components: { Work },
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
      return _.orderBy(works, 'name');
    },

    emitUpdate(args) {
      this.$emit('update-selected-work', args)
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
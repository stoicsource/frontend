<template>
  <div class="container author-list">
    <div class="card mt-2" v-for="author in augmentedAuthors" :key="author.id">
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

        <a @click="navigateToAuthor(author)" class="stretched-link"></a>
      </div>
    </div>
  </div>
</template>

<script>
import Author from "@/store/models/Author";
import ContentService from "../services/ContentService";
import Content from "../store/models/Content";

export default {
  data() {
    return {}
  },
  computed: {
    authors() {
      return Author.query().has('works').withAllRecursive().orderBy('shortestName').all();
    },

    augmentedAuthors() {
      let authors = this.authors;

      authors.push({
        id: 'random',
        shortestName: 'Random',
        works: [
          {
            name: 'Let fate decide where to take you'
          }
        ]
      });

      return authors;
    }
  },
  methods: {
    navigateToAuthor(author) {
      if (author.id === 'random') {
        ContentService.getRandomItem().then(function (randomContent) {
          let randomContentWithRelations = Content.query().whereId(randomContent.id).with(['edition.work.author', 'tocEntry']).first()
          this.$router.push(
              '/' + randomContentWithRelations.edition.work.author.urlSlug +
              '/' + randomContentWithRelations.edition.work.urlSlug +
              '/' + randomContentWithRelations.tocEntry.label
          );
        }.bind(this));
      } else {
        if (author.works.length === 1) {
          this.$router.push('/' + author.urlSlug + '/' + author.works[0].urlSlug);
        } else {
          this.$router.push('/' + author.urlSlug + '/works');
        }
      }
    }
  }
}
</script>

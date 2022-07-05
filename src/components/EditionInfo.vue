<template>
  <div v-if="edition" class="container-fluid mt-2 position-relative">
    <div class="position-absolute top-0 end-0 me-2">
      <a @click="$router.go(-1)">
        <font-awesome-icon icon="times-circle" size="xl" class="text-secondary"/>
      </a>
    </div>

    <h1>{{ edition.name }}</h1>
    <p>
      published in: {{ edition.year }}<br>
      translated by: {{ edition.author.name }}
      <span v-if="edition.author.yearsAlive || edition.author.summary">
        (<span v-if="edition.author.yearsAlive">{{ edition.author.yearsAlive }}</span>
        <span v-if="edition.author.summary">, {{ edition.author.summary }}</span>)
      </span>
    </p>
    <p v-if="edition.contributor">
      contributed to StoicSource by <br>
      {{ edition.contributor.name }} (<a :href="'mailto:' + edition.contributor.email">mail</a>
      | <a :href="edition.contributor.website" target="_blank">web</a> )
    </p>
  </div>
</template>

<script>
import Edition from "../store/models/Edition";
import EditionService from "../services/EditionService";

export default {
  name: "EditionInfo",
  props: {
    editionId: [Number, String]
  },
  created() {
    this.$watch(
        () => this.$route.params,
        () => { this.onRouteChange() },
        { immediate: true }
    )
  },
  computed: {
    edition() {
      return Edition.query().whereId(parseInt(this.editionId)).with(['author']).first();
    }
  },
  methods: {
    onRouteChange() {
      if (!this.edition || !this.edition.contributor) {
        EditionService.requireEdition(this.editionId);
      }
    }
  }
}
</script>

<style scoped>
h1 {
  font-size: 1.1em;
}
</style>
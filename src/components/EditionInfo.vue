<template>
  <div v-if="edition" class="container-fluid mt-2">
    <h1>{{ edition.name }}</h1>
    <p>
      published in: {{ edition.year }}<br>
      translated by: {{ edition.author.name }}
      <span v-if="edition.author.yearsAlive || edition.author.summary">
        (<span v-if="edition.author.yearsAlive">{{ edition.author.yearsAlive }}</span>
        <span v-if="edition.author.summary">, {{ edition.author.summary }}</span>)
      </span>
    </p>
    <p>
      <a @click="$router.go(-1)">back</a>
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
        () => {
          this.onRouteChange()
        },
        {immediate: true}
    )
  },
  computed: {
    edition() {
      let edition = Edition.query().whereId(parseInt(this.editionId)).with(['author']).first();
      return edition;
    }
  },
  methods: {
    onRouteChange() {
      if (!this.edition) {
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
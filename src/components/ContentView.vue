<template>
  <div v-if="selectedWorkId">
    {{ selectedWork.name }}
    <div v-for="edition in selectedWork.editions" :key="edition.id">
      <div v-if="edition.checked">{{ edition.authorsFormatted }} ({{ edition.year }})</div>
    </div>
  </div>
</template>

<script>
import {mapState} from 'vuex'
import Work from "@/store/models/Work";

export default {
  components: {},
  data () {
    return {}
  },
  computed: {
    ...mapState('app', [
      'selectedWorkId'
    ]),

    selectedWork () {
      return Work.query().where('id', this.selectedWorkId).with(['editions', 'editions.authors']).first();
    }
  },
  methods: {}
}
</script>

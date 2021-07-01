<template>
  <div>
    test: {{ selectedWork }}
  </div>
</template>

<script>
import {mapState} from 'vuex'

export default {
  components: {},
  data () {
    return {}
  },
  computed: {
    ...mapState('app', [
      'selectedWork'
    ])
  },
  methods: {}
}
</script>

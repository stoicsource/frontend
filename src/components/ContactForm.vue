<template>
  <b-modal id="contact-modal" title="Contact">
    <div>
      Send us an email to <a href="mailto:feedback@stoicsource.com">feedback@stoicsource.com</a><br>
      We'd love to hear from you!
    </div>
    <template #modal-footer="{ cancel }">
      <b-button size="sm" @click="cancel()">
        Close
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import Author from "@/store/models/Author";

export default {
  data () {
    return {
      contactName: '',
      contactEmail: '',
      contactMessage: ''
    }
  },
  computed: {
    workAuthors () {
      return Author.query().has('works').withAllRecursive().orderBy('shortestName').all();
    }
  },
  methods: {

  }
}
</script>

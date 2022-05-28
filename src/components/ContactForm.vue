<template>
  <div class="modal" tabindex="-1" id="contact-modal">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Contact</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          Send us an email to <a href="mailto:feedback@stoicsource.com">feedback@stoicsource.com</a><br>
          We'd love to hear from you!
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>
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

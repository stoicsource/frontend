<template>
  <b-modal id="contact-modal" title="Contact">
    <b-form>
      <ValidationProvider name="Name" rules="required" v-slot="{ errors }">
        <b-form-group>
          <b-form-input v-model="contactName" placeholder="Name" name="email" required></b-form-input>
          <span>{{ errors[0] }}</span>
        </b-form-group>
      </ValidationProvider>

      <ValidationProvider name="E-mail" rules="required|email" v-slot="{ errors }">
        <b-form-group>
          <b-form-input v-model="contactEmail" placeholder="Email" required type="email"></b-form-input>
          <span>{{ errors[0] }}</span>
        </b-form-group>
      </ValidationProvider>

      <ValidationProvider name="Message" rules="required" v-slot="{ errors }">
        <b-form-group>
          <b-form-textarea
              id="textarea"
              v-model="contactMessage"
              placeholder="Message..."
              rows="6"
              required
          ></b-form-textarea>
          <span>{{ errors[0] }}</span>
        </b-form-group>
      </ValidationProvider>
    </b-form>
    <template #modal-footer="{ cancel }">
      <b-button size="sm" variant="primary" @click="send()">
        Send
      </b-button>
      <b-button size="sm" @click="cancel()">
        Cancel
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import Author from "@/store/models/Author";
import {ValidationProvider, extend} from 'vee-validate';
import {required, email} from 'vee-validate/dist/rules';
import Swal from 'sweetalert2'

const axios = require('axios');

extend('email', email);

extend('required', {
  ...required,
  message: 'This field is required'
});

export default {
  components: {
    ValidationProvider
  },
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
    send () {
      if (this.contactName && this.contactEmail && this.contactMessage) {
        const formData = new FormData();
        formData.append('name', this.contactName);
        formData.append('email', this.contactEmail);
        formData.append('message', this.contactMessage);

        // axios.post(process.env.VUE_APP_API_URL + '/contact', formData, { withCredentials: true })
        axios.post(process.env.VUE_APP_API_URL + '/contact', formData)
            .then(function () {
              this.contactName = '';
              this.contactEmail = '';
              this.contactMessage = '';

              Swal.fire({
                title: 'Message submitted',
                text: 'Thank you for your feedback!',
                showCancelButton: false,
                confirmButtonText: 'Ok'
              });
            }.bind(this));

        this.$bvModal.hide('contact-modal');
      }
    }
  }
}
</script>

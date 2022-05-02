<template>
  <b-overlay :show="loading">
    <b-navbar toggleable="lg" type="dark" variant="primary" sticky class="modified-nav">
      <b-navbar-brand v-if="selectedWork">
        <span>{{ selectedWork.name }}</span><br>
        <span class="nav-author-name">{{ selectedWork.authorsFormatted }}</span>
      </b-navbar-brand>
      <b-navbar-brand v-else>
        <span>StoicSource</span>
      </b-navbar-brand>

      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">
        <b-nav-item @click="showWorkSelect" class="nav-work-selector">
          <font-awesome-icon icon="bars"/>
          <span class="d-none d-md-inline">Switch to different Work</span>
        </b-nav-item>
      </b-navbar-nav>
    </b-navbar>

    <router-view class="router-view"></router-view>

    <contact-form></contact-form>

    <footer class="text-center text-muted mb-3">
      Feedback? Questions? <span @click="showContact" class="link-style">Contact us</span>
    </footer>
  </b-overlay>
</template>

<script>
import Clipboard from 'clipboard'
import Work from '@/store/models/Work'
import {mapMutations, mapState} from "vuex";
import ContactForm from "@/components/ContactForm";
import SelectionInfoService from "@/services/SelectionInfoService";

export default {
  name: 'App',
  components: { ContactForm },
  data () {
    return {
      loading: false
    }
  },
  mounted () {
    this.loading = true;
    new Clipboard('#copy-button');
    SelectionInfoService.loadFromLocalStorage();

    Work.api().get(process.env.VUE_APP_API_URL + '/works')
        .catch(function (error) {
          console.log(error);
          alert(error.message);
        })
        .then(function () {
          this.loading = false;
        }.bind(this));


  },
  methods: {
    ...mapMutations('app', ['setActiveWork']),

    showContact () {
      this.$bvModal.show('contact-modal');
    },
    showWorkSelect () {
      this.$router.push({name: 'authorSelect'})
    }
  },
  computed: {
    ...mapState('app', ['activeWork']),

    selectedWork () {
      return this.activeWork ? Work.query().whereId(this.activeWork.id).with(['authors']).first() : null;
    }
  }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

td, th {
  text-align: left;
  vertical-align: top;
  padding-bottom: 1em;
}

.text-muted {
  a, .link-style {
    color: #6c757d;
    text-decoration: underline;
  }
}

.col-12.sticky-sidebar {
  @media (min-width: 768px) {
    position: sticky;
    height: calc(100vh - 90px);
    top: 80px;
    overflow-y: scroll;
  }
}

.router-view {
  min-height: 84vh;
}

.navbar.modified-nav.navbar-dark {
  padding-bottom: 0;

  .navbar-brand {
    padding-top: 0;

    .nav-author-name {
      position: relative;
      top: -7px;
      font-size: 0.7em;
    }
  }

  .nav-link {
    color: rgba(255, 255, 255, 1);
  }

  .nav-work-selector {
    font-size: 2em;
    color: white;
    position: relative;
    top: -3px;
    left: -8px;
    border-left: 1px solid lightgray;
    padding-left: 0.8em;

    @media (min-width: 768px) {
      font-size: 1.2em;
      border: none;

      svg {
        margin-right: 0.5em;
      }
    }
  }
}
</style>

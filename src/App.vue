<template>
  <div>
    <nav class="navbar modified-nav sticky-top navbar-dark bg-primary navbar-expand-lg">
      <div class="container-fluid">
        <div v-if="selectedWork" class="navbar-brand">
          <span>{{ selectedWork.name }}</span><br>
          <span class="nav-author-name">{{ selectedWork.authorsFormatted }}</span>
        </div>
        <div v-else class="navbar-brand">
          <span>StoicSource</span>
        </div>

        <ul class="navbar-nav ml-auto">
          <li class="nav-item nav-work-selector">
            <router-link :to="{name: 'authorSelect'}" class="nav-link">
              <font-awesome-icon icon="bars"/>
              <span class="d-none d-md-inline">Switch to different Work</span>
            </router-link>
          </li>
        </ul>
      </div>
    </nav>

    <div v-if="loading" class="d-flex justify-content-center align-items-center" style="min-height: 80vh;">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <router-view v-else class="router-view"></router-view>

    <contact-form></contact-form>

    <footer class="text-center text-muted mb-3">
      Feedback? Questions?
      <button type="button" class="link-style" data-bs-toggle="modal" data-bs-target="#contact-modal" style="border: none; background: transparent;">
        Contact us
      </button>
    </footer>
  </div>
</template>

<script>
import axios from 'axios'
import Work from '@/store/models/Work'
import { mapState} from "vuex";
import ContactForm from "@/components/ContactForm";
import SelectionInfoService from "@/services/SelectionInfoService";
import Author from "./store/models/Author";
import Edition from "./store/models/Edition";

export default {
  name: 'App',
  components: {ContactForm},
  data () {
    return {
      loading: false
    }
  },
  mounted () {
    this.loading = true;

    axios.interceptors.response.use(function (response) {
      return response;
    }, function (error) {
      console.log(error);
      alert(error.message);
      return Promise.reject(error);
    });

    SelectionInfoService.loadFromLocalStorage();

    Promise.all([
        Work.api().get('works'),
        Author.api().get('authors')
        ])
        .then(function () {
          this.loading = false;
        }.bind(this));

    Edition.api().get('editions');
  },
  computed: {
    ...mapState('app', ['activeWork']),

    selectedWork () {
      return this.activeWork ? Work.query().whereId(this.activeWork.id).with(['author']).first() : null;
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

.router-view {
  min-height: 84vh;
}

.navbar.modified-nav.navbar-dark {
  padding: 0.5rem 1rem 0;

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

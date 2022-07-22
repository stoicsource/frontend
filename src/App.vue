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
            <a class="nav-link" @click="showWorkSelect">
              <font-awesome-icon icon="bars"/>
              <span class="d-none d-md-inline">Switch to different Work</span>
            </a>
          </li>
        </ul>
      </div>
    </nav>

    <router-view class="router-view"></router-view>

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
import Work from '@/store/models/Work'
import {mapMutations, mapState} from "vuex";
import ContactForm from "@/components/ContactForm";
import SelectionInfoService from "@/services/SelectionInfoService";
import Author from "./store/models/Author";

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
    SelectionInfoService.loadFromLocalStorage();

    Promise.all([
        Work.api().get('works'),
        Author.api().get('authors')
        ])

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

    showWorkSelect () {
      this.$router.push({name: 'authorSelect'})
    }
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

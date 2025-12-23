<script setup lang="ts">
import { RouterView } from "vue-router";
import { useWorksStore } from "@/stores/works";
import { useGeneralStore } from "@/stores/general";
import ContactForm from "./components/ContactForm.vue";
import axios from "axios";
import { ref } from "vue";

const generalStore = useGeneralStore();
const worksStore = useWorksStore();

const errorMessage = ref<string | null>(null);

function showError(message: string) {
  errorMessage.value = message;
  setTimeout(() => {
    errorMessage.value = null;
  }, 5000);
}

axios.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    console.error("API Error:", error);
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";
    showError(message);
    return Promise.reject(error);
  },
);
</script>

<template>
  <div>
    <div
      v-if="errorMessage"
      class="alert alert-danger alert-dismissible fade show m-0 rounded-0"
      role="alert"
      style="position: sticky; top: 0; z-index: 1050"
    >
      <strong>Error:</strong> {{ errorMessage }}
      <button
        type="button"
        class="btn-close"
        @click="errorMessage = null"
        aria-label="Close"
      ></button>
    </div>
    <nav
      class="navbar modified-nav sticky-top navbar-dark bg-primary navbar-expand-lg"
    >
      <div class="container-fluid">
        <div v-if="worksStore.activeWork" class="navbar-brand">
          <span>{{ worksStore.activeWork?.name }}</span
          ><br />
          <span class="nav-author-name">{{
            worksStore.activeWork?.author?.shortestName()
          }}</span>
        </div>
        <div v-else class="navbar-brand">
          <span>StoicSource</span>
        </div>

        <ul class="navbar-nav ml-auto">
          <li class="nav-item nav-work-selector">
            <router-link :to="{ name: 'authorSelect' }" class="nav-link">
              <i class="fa-solid fa-bars"></i>
              <span class="d-none d-md-inline">Switch to different Work</span>
            </router-link>
          </li>
        </ul>
      </div>
    </nav>

    <div
      v-if="generalStore.globalLoading"
      class="d-flex justify-content-center align-items-center"
      style="min-height: 80vh"
    >
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <router-view v-else class="router-view"></router-view>

    <contact-form></contact-form>

    <footer class="text-center text-muted mb-3">
      Feedback? Questions?
      <button
        type="button"
        class="link-style"
        data-bs-toggle="modal"
        data-bs-target="#contact-modal"
        style="border: none; background: transparent"
      >
        Contact us
      </button>
    </footer>
  </div>
</template>

<style lang="scss">
td,
th {
  text-align: left;
  vertical-align: top;
  padding-bottom: 1em;
}

.text-muted {
  a,
  .link-style {
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

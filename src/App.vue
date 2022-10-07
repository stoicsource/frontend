<script setup lang="ts">
import { RouterView } from "vue-router";
</script>

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
              <i class="fa-solid fa-bars"></i>
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

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}
</style>

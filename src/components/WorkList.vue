<template>
  <div class="work-list">
    <div>Works</div>

    <div class="accordion mt-2 d-none d-lg-block" role="tablist">
      <b-card no-body class="mb-1" v-for="work in works" :key="work.id">
        <b-card-header header-tag="header" class="p-1" role="tab" v-b-toggle="'collapseWork' + work.id">
          {{ work.name }}
        </b-card-header>
        <b-collapse :id="'collapseWork' + work.id" accordion="work-accordion" role="tabpanel">
          <b-card-body>
            <b-card-text class="">

            </b-card-text>
          </b-card-body>
        </b-collapse>
      </b-card>
    </div>

  </div>
</template>

<script>
import Work from '@/store/models/Work'

export default {
  computed: {
    works () {
      return Work.all()
    }
  }
}
</script>

<style scoped>

</style>

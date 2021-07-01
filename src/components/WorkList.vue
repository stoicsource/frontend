<template>
  <div class="work-list">
    <div v-for="workAuthor in workAuthors" :key="workAuthor.id" class="mt-3">
      {{ workAuthor.shortestName }}

      <div class="accordion mt-2 d-none d-lg-block" role="tablist">
        <b-card no-body class="mb-1" v-for="work in sortedWorks(workAuthor.works)" :key="work.id">
          <b-card-header header-tag="header" class="p-1" role="tab" v-b-toggle="'collapseWork' + work.id">
            {{ work.name }}
          </b-card-header>
          <b-collapse :id="'collapseWork' + work.id" accordion="work-accordion" role="tabpanel" @shown="setSelectedWorkId(work)">
            <b-card-body>
              <b-card-text class="">
                <div v-for="edition in work.editions" :key="edition.id">
                  <b-form-checkbox v-model="edition.selected" :name="'check-button-' + edition.id" switch @change="toggleEdition(edition)">
                    {{ edition.authorsFormatted }} ({{ edition.year }})
                  </b-form-checkbox>
                </div>

              </b-card-text>
              <b-card-text class="">
                <a v-for="tocEntry in work.tocEntries" :key="tocEntry.id" @click="selectTocEntry(tocEntry)" class="toc-link">{{ tocEntry.label }}</a>
              </b-card-text>
            </b-card-body>
          </b-collapse>
        </b-card>
      </div>
    </div>

  </div>
</template>

<script>
import {mapMutations} from 'vuex'
import _ from 'lodash'
import Author from "@/store/models/Author";
import Edition from "@/store/models/Edition";
import TocEntry from "@/store/models/TocEntry";

export default {
  components: {},
  data () {
    return {
    }
  },
  computed: {
    workAuthors () {
      return Author.query().has('works').withAllRecursive().orderBy('shortestName').all();
    }
  },
  methods: {
    ...mapMutations('app', [
      'setSelectedWorkId'
    ]),

    sortedWorks (works) {
      return _.orderBy(works, 'name');
    },

    toggleEdition (edition) {
      Edition.update({
        where: edition.id,
        data: {
          selected: edition.selected
        }
      })
    },

    selectTocEntry (tocEntry) {
      TocEntry.update({
        where: tocEntry.id,
        data: {
          selected: true
        }
      })
    }
  }
}
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style lang="scss" scoped>
a.toc-link {
  display: inline-block;
  margin-left: 0.3em;
  text-decoration: underline;
}
</style>
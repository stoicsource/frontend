<script setup lang="ts">


import {Work} from "@/models/Work";
import {TocEntry} from "@/models/TocEntry";
import {Edition} from "@/models/Edition";
import {computed} from "vue";

const props = defineProps<{
  work: Work;
  tocEntry: TocEntry;
  edition: Edition;
}>();

// elementScrollIntoViewPolyfill();

function canShare() {
  return navigator.share;
};

</script>

<template>
  <div class="translation-content" v-if="work && tocEntry">
    <div class="content-navigation bg-light">
      <span><strong>{{ tocEntry.label }}</strong></span>
      <a @click="previousTocEntry()" v-if="tocEntry.hasPrevious()" class="btn btn-outline-secondary btn-sm"><i class="fa-solid fa-circle-up"></i></a>
      <a @click="nextTocEntry()" v-if="tocEntry.hasNext()" class="btn btn-outline-secondary btn-sm"><i class="fa-solid fa-circle-down"></i></a>
      <a class="d-lg-none btn btn-outline-secondary btn-sm" data-bs-toggle="collapse" href="#collapseWorkEditions" role="button"><i class="fa-solid fa-list"></i></a>
      <a @click="randomTocEntry()" class="btn btn-outline-secondary btn-sm"><i class="fa-solid fa-shuffle"></i></a>
      <a v-if="canShare()" @click="shareEntry" class="btn btn-outline-secondary btn-sm"><i class="fa-solid fa-share-nodes"></i></a>
    </div>

    <h1 v-if="contentItem && contentItem.title && contentItem.contentType === 'text'">
      {{ contentItem.title }}</h1>
    <h1 v-else-if="contentItem && contentItem.title" v-html="contentItem.title"></h1>

    <div v-if="contentItem && contentItem.contentType === 'text'">
      <p v-for="paragraph in getContent(tocEntry, edition).split('\n')" :key="paragraph.substring(0, 12)">{{
          paragraph
        }}</p>
    </div>
    <div v-else>
      <component :is="compiledContent" @note-clicked="scrollToNote"></component>
    </div>

    <div v-if="contentItem && contentItem.notes > ''" class="translator-notes">
      Translator notes: <br>
      <div v-if="contentItem.contentType === 'text'">
        {{ contentItem.notes }}
      </div>
      <div v-else-if="contentItem.notesFormat === 'json'">
        <ol>
          <li v-for="jsonNote in contentItem.jsonNotes" :key="jsonNote.id" :ref="'note' + jsonNote.id" :id="'note' + jsonNote.id">
            <div v-html="jsonNote.content"></div>
            <div @click.prevent="scrollToReference(jsonNote.id)" class="footnote-backlink"><i class="fa-solid fa-up-long"></i></div>
          </li>
        </ol>
      </div>
      <div v-else v-html="contentItem.notes"></div>
    </div>
  </div>
</template>

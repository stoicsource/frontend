<script setup lang="ts">
import { elementScrollIntoViewPolyfill } from "seamless-scroll-polyfill";
import type { Work } from "@/models/Work";
import type { TocEntry } from "@/models/TocEntry";
import type { Edition } from "@/models/Edition";
import { computed } from "vue";
import { useChaptersStore } from "@/stores/chapters";

elementScrollIntoViewPolyfill();

const props = defineProps<{
  work: Work;
  tocEntry: TocEntry;
  edition: Edition;
}>();

const emit = defineEmits(["content-missing", "on-navigate"]);

const chaptersStore = useChaptersStore();

const contentItem = computed(() => {
  return chaptersStore.getContentItem(props.tocEntry, props.edition);
});

function contentAvailable() {
  if (!contentItem.value) {
    emit("content-missing", null);
    return false;
  } else {
    return true;
  }
}

function getContent() {
  if (!contentItem.value) {
    return "...";
  } else {
    return contentItem.value.content;
  }
}

function previousTocEntry() {
  navigateToTocEntry(props.tocEntry?.previous);
}

function nextTocEntry() {
  navigateToTocEntry(props.tocEntry?.next);
}

function randomTocEntry() {
  let nextEntry = props.tocEntry;
  while (
    props.work.tocEntries &&
    props.work.tocEntries.length > 1 &&
    nextEntry.id === props.tocEntry.id
  ) {
    let entryIndex = Math.floor(Math.random() * props.work.tocEntries.length);
    nextEntry = props.work.tocEntries[entryIndex];
  }
  navigateToTocEntry(nextEntry);
}

function navigateToTocEntry(tocEntry: TocEntry | null) {
  emit("on-navigate", tocEntry);
}

function canShare() {
  return navigator.share;
}

function shareEntry() {
  if (navigator.share) {
    navigator
      .share({
        title:
          props.work.author?.shortName +
          " - " +
          props.work.name +
          " " +
          props.tocEntry.label,
        url: window.location.href,
      })
      .then(() => {
        console.log("Thanks for sharing!");
      })
      .catch(console.error);
  }
}

function contentClicked(event: MouseEvent) {
  let target = event.target as HTMLElement;
  let reference: string | null = null;
  if (target.tagName === "SUP") {
    reference = target.getAttribute("data-footnote-reference");
  }

  if (reference) {
    scrollToNote(parseInt(reference));
  }
}

let lastScrollTop = 0;
let lastNoteNumber = 0;
function scrollToNote(noteNr: number) {
  lastScrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  lastNoteNumber = noteNr;
  document
    .getElementById("note" + noteNr)
    ?.scrollIntoView({ behavior: "smooth" });
}

function scrollToReference(noteNr: number) {
  if (lastNoteNumber === noteNr) {
    document.documentElement.scrollTop = document.body.scrollTop =
      lastScrollTop;
  } else {
    document
      .getElementById("reference" + noteNr)
      ?.scrollIntoView({ behavior: "smooth" });
  }
}
</script>

<template>
  <div class="translation-content" v-if="work && tocEntry">
    <div class="content-navigation bg-light">
      <span
        ><strong>{{ tocEntry.label }}</strong></span
      >
      <a
        @click="previousTocEntry()"
        v-if="tocEntry.previous"
        class="btn btn-outline-secondary btn-sm"
        ><i class="fa-solid fa-circle-up"></i
      ></a>
      <a
        @click="nextTocEntry()"
        v-if="tocEntry.next"
        class="btn btn-outline-secondary btn-sm"
        ><i class="fa-solid fa-circle-down"></i
      ></a>
      <a
        class="d-lg-none btn btn-outline-secondary btn-sm"
        data-bs-toggle="collapse"
        href="#collapseWorkEditions"
        role="button"
        ><i class="fa-solid fa-list"></i
      ></a>
      <a @click="randomTocEntry()" class="btn btn-outline-secondary btn-sm"
        ><i class="fa-solid fa-shuffle"></i
      ></a>
      <a
        v-if="canShare()"
        @click="shareEntry"
        class="btn btn-outline-secondary btn-sm"
        ><i class="fa-solid fa-share-nodes"></i
      ></a>
    </div>

    <div v-if="chaptersStore.chaptersLoading">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div v-else-if="contentAvailable() && contentItem">
      <h1 v-if="contentItem.title && contentItem.contentType === 'text'">
        {{ contentItem.title }}
      </h1>
      <h1 v-else-if="contentItem.title" v-html="contentItem.title"></h1>

      <div v-if="contentItem.contentType === 'text'">
        <p
          v-for="paragraph in getContent().split('\n')"
          :key="paragraph.substring(0, 12)"
        >
          {{ paragraph }}
        </p>
      </div>
      <div v-else>
        <div v-html="getContent()" @click.prevent="contentClicked"></div>
      </div>

      <div v-if="contentItem.notes > ''" class="translator-notes">
        Translator notes: <br />
        <div v-if="contentItem.contentType === 'text'">
          {{ contentItem.notes }}
        </div>
        <div v-else-if="contentItem.notesFormat === 'json'">
          <ol>
            <li
              v-for="jsonNote in contentItem.jsonNotes"
              :key="jsonNote.id"
              :ref="'note' + jsonNote.id"
              :id="'note' + jsonNote.id"
            >
              <div v-html="jsonNote.content"></div>
              <div
                @click.prevent="scrollToReference(jsonNote.id)"
                class="footnote-backlink"
              >
                <i class="fa-solid fa-up-long"></i>
              </div>
            </li>
          </ol>
        </div>
        <div v-else v-html="contentItem.notes"></div>
      </div>
    </div>
    <div v-else>Content not found</div>
  </div>
</template>

<style lang="scss" scoped>
.translation-content {
  max-width: 35em;
  line-height: 1.6em;

  .content-action {
    visibility: hidden;
    display: inline-block;
    padding: 0 5px;
    color: gray;
    cursor: pointer;
    border: 1px solid lightgray;
    border-radius: 6px;

    &:not(:first-child) {
      margin-left: 0.5em;
    }
  }

  &:hover {
    .content-action {
      visibility: visible;
    }
  }

  :deep(blockquote) {
    border-left: 3px solid #eaecf0;
    padding: 8px 22px;
  }

  :deep(a) {
    scroll-margin-top: 80px;
    text-decoration: none;
    font-weight: 700;
  }

  :deep(sup) {
    margin-left: 0.2em;
    margin-right: 0.3em;
    font-weight: 700;
    color: #0b54a1;
  }

  :deep(sup[data-footnote-reference]) {
    &:before {
      content: "[";
    }

    &:after {
      content: "]";
    }
  }
}

.content-navigation {
  float: left;
  position: relative;
  top: 6px;
  margin-right: 0.75em;
  margin-bottom: 0.5em;
  border-radius: 3px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid rgb(222, 226, 230);

  a {
    margin-top: 0.2em;
  }
}

.translator-notes {
  font-size: 0.8em;
  line-height: 1.3em;
  font-style: italic;
  color: #444;

  .footnote-backlink {
    margin-top: -1em;
    margin-bottom: 1em;
  }

  li {
    scroll-margin-top: 80px;
  }
}
</style>
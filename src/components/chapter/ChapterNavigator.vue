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

const chapter = computed(() => {
  return chaptersStore.getChapter(props.tocEntry, props.edition);
});

function chapterAvailable() {
  if (!chapter.value) {
    emit("content-missing", null);
    return false;
  } else {
    return true;
  }
}

function getChapterContent() {
  if (!chapter.value) {
    return "...";
  } else {
    return chapter.value.content;
  }
}

function previousChapter() {
  navigateToChapter(props.tocEntry?.previous);
}

function nextChapter() {
  navigateToChapter(props.tocEntry?.next);
}

function randomChapter() {
  let nextEntry = props.tocEntry;
  while (
    props.work.tocEntries &&
    props.work.tocEntries.length > 1 &&
    nextEntry.id === props.tocEntry.id
  ) {
    let entryIndex = Math.floor(Math.random() * props.work.tocEntries.length);
    nextEntry = props.work.tocEntries[entryIndex];
  }
  navigateToChapter(nextEntry);
}

function navigateToChapter(tocEntry: TocEntry | null) {
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
  let targetFootnoteElement = document.getElementById("note" + noteNr);
  targetFootnoteElement?.classList.add("active");
  targetFootnoteElement?.scrollIntoView({ behavior: "smooth" });
}

function scrollToReference(noteNr: number) {
  if (lastNoteNumber === noteNr) {
    document.documentElement.scrollTop = document.body.scrollTop =
      lastScrollTop;
    setTimeout(() => {
      // The following lines break the above scroll functionality in Firefox with live build if they are not executed async. Dunno why, works in dev mode.
      let footnoteElement = document.getElementById("note" + noteNr);
      footnoteElement?.classList.remove("active");
    }, 1);
  }
}
</script>

<template>
  <div class="chapter" v-if="work && tocEntry">
    <div class="chapter-navigation bg-light">
      <span
        ><strong>{{ tocEntry.label }}</strong></span
      >
      <a
        @click="previousChapter()"
        v-if="tocEntry.previous"
        class="btn btn-outline-secondary btn-sm"
        ><i class="fa-solid fa-circle-up"></i
      ></a>
      <a
        @click="nextChapter()"
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
      <a @click="randomChapter()" class="btn btn-outline-secondary btn-sm"
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
    <div v-else-if="chapterAvailable() && chapter">
      <h1 v-if="chapter.title && chapter.contentType === 'text'">
        {{ chapter.title }}
      </h1>
      <h1
        v-else-if="chapter.title"
        v-html="chapter.title"
        @click.prevent="contentClicked"
      ></h1>

      <div v-if="chapter.contentType === 'text'">
        <p
          v-for="paragraph in getChapterContent().split('\n')"
          :key="paragraph.substring(0, 12)"
        >
          {{ paragraph }}
        </p>
      </div>
      <div v-else>
        <div v-html="getChapterContent()" @click.prevent="contentClicked"></div>
      </div>

      <div v-if="chapter.notes > ''" class="translator-notes">
        Translator notes: <br />
        <div v-if="chapter.contentType === 'text'">
          {{ chapter.notes }}
        </div>
        <div v-else-if="chapter.notesFormat === 'json'">
          <ol>
            <li
              v-for="jsonNote in chapter.jsonNotes"
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
        <div v-else v-html="chapter.notes"></div>
      </div>
    </div>
    <div v-else>Content not found</div>
  </div>
</template>

<style lang="scss" scoped>
.chapter {
  max-width: 35em;
  line-height: 1.6em;

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

.chapter-navigation {
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

  li {
    scroll-margin-top: 80px;

    .footnote-backlink {
      visibility: hidden;
    }

    &.active {
      .footnote-backlink {
        visibility: visible;
        margin-bottom: 1em;
      }
    }
  }
}
</style>

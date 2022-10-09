import { createRouter, createWebHistory } from "vue-router";
import AuthorSelect from "../views/AuthorSelect.vue";
import WorkSelect from "../views/WorkSelect.vue";
import ChapterView from "../views/ChapterView.vue";
import EditionInfoView from "../views/EditionInfoView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Redirects from old URL format
    { path: "/meditations", redirect: "/aurelius/meditations" },
    {
      path: "/meditations/:tocSlug",
      redirect: "/aurelius/meditations/:tocSlug",
    },
    {
      path: "/meditations/:tocSlug/:translator",
      redirect: "/aurelius/meditations/:tocSlug/:translator",
    },
    { path: "/enchirideon", redirect: "/epictetus/enchirideon" },
    {
      path: "/enchirideon/:tocSlug",
      redirect: "/epictetus/enchirideon/:tocSlug",
    },
    {
      path: "/enchirideon/:tocSlug/:translator",
      redirect: "/epictetus/enchirideon/:tocSlug/:translator",
    },

    // Starting screen
    { path: "/", component: AuthorSelect, name: "authorSelect" },

    // Information about a specific edition
    {
      path: "/edition/:editionId/info",
      component: EditionInfoView,
      props: true,
      name: "editionInfo",
    },

    // Work Select
    { path: "/:authorSlug/works", component: WorkSelect, props: true },

    // Main content view
    { path: "/:author/:workSlug", component: ChapterView, props: true },
    {
      path: "/:author/:workSlug/:tocSlug",
      component: ChapterView,
      props: true,
      name: "contentByToc",
    },
    {
      path: "/:author/:workSlug/:tocSlug/:translatorSlug",
      component: ChapterView,
      props: true,
      name: "contentByTocAndTranslator",
    },

    // {
    //   path: "/about",
    //   name: "about",
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import("../views/AboutView.vue"),
    // },
  ],
});

export default router;

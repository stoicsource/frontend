import { createRouter, createWebHistory } from "vue-router";

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
    {
      path: "/",
      component: () => import("../views/AuthorSelectView.vue"),
      name: "authorSelect",
    },

    // Show a "not available info" for Musonius Rufus by Lutz
    {
      path: "/rufus/:pathMatch(.*)*",
      component: () => import("../views/RufusLutzView.vue"),
    },

    // Information about a specific edition
    {
      path: "/edition/:editionId/info",
      props: true,
      name: "editionInfo",
      component: () => import("../views/EditionInfoView.vue"),
    },

    // Work Select
    {
      path: "/:authorSlug/works",
      component: () => import("../views/WorkSelectView.vue"),
      props: true,
    },

    // Main chapter view
    {
      path: "/:author/:workSlug",
      component: () => import("../views/ChapterView.vue"),
      props: true,
    },
    {
      path: "/:author/:workSlug/:tocSlug",
      component: () => import("../views/ChapterView.vue"),
      props: true,
      name: "contentByToc",
    },
    {
      path: "/:author/:workSlug/:tocSlug/:translatorSlug",
      component: () => import("../views/ChapterView.vue"),
      props: true,
      name: "contentByTocAndTranslator",
    },
  ],
});

export default router;

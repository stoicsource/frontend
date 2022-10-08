import { createRouter, createWebHistory } from "vue-router";
import AuthorSelect from "../views/AuthorSelect.vue";
import WorkSelect from "../views/WorkSelect.vue";
import ChapterView from "../views/ChapterView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Starting screen
    { path: "/", component: AuthorSelect, name: "authorSelect" },

    // Work Select
    { path: "/:authorSlug/works", component: WorkSelect, props: true },

    // Main content view
    { path: "/:author/:workSlug", component: ChapterView, props: true },
    {
      path: "/:author/:workSlug/:tocSlug",
      component: ChapterView,
      props: true,
    },
    {
      path: "/:author/:workSlug/:tocSlug/:translatorSlug",
      component: ChapterView,
      props: true,
      name: "contentByToc",
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

import Vue from 'vue'
import VueRouter from 'vue-router'
import AuthorSelect from "../views/AuthorSelect";
import WorkSelect from "../views/WorkSelect";
import ContentView from "../views/MainView";
import EditionInfo from "../views/EditionInfo";

Vue.use(VueRouter)

const routes = [
  // Redirects from old URL format
  { path: '/meditations', redirect: '/aurelius/meditations' },
  { path: '/meditations/:tocSlug', redirect: '/aurelius/meditations/:tocSlug' },
  { path: '/meditations/:tocSlug/:translator', redirect: '/aurelius/meditations/:tocSlug/:translator' },
  { path: '/enchirideon', redirect: '/epictetus/enchirideon' },
  { path: '/enchirideon/:tocSlug', redirect: '/epictetus/enchirideon/:tocSlug' },
  { path: '/enchirideon/:tocSlug/:translator', redirect: '/epictetus/enchirideon/:tocSlug/:translator' },

  // Information about a specific edition
  { path: '/edition/:editionId/info', component: EditionInfo, props: true, name: 'editionInfo' },

  // Starting screen
  { path: '/', component: AuthorSelect, name: 'authorSelect' },

  // Main content view
  { path: '/:author/works', component: WorkSelect, props: true },
  { path: '/:author/:workSlug', component: ContentView, props: true },
  { path: '/:author/:workSlug/:tocSlug', component: ContentView, props: true },
  { path: '/:author/:workSlug/:tocSlug/:translatorSlug', component: ContentView, props: true, name: 'contentByToc' },
]

const router = new VueRouter({
  mode: 'history',
  routes
})

export default router
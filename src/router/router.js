import Vue from 'vue'
import VueRouter from 'vue-router'
import AuthorSelect from "../components/AuthorSelect";
import WorkSelect from "../components/WorkSelect";
import ContentView from "../components/ContentView/ContentView";
import EditionInfo from "../components/EditionInfo";

Vue.use(VueRouter)

const routes = [
  // Redirects from old URL format
  { path: '/meditations', redirect: '/aurelius/meditations' },
  { path: '/meditations/:tocSlug', redirect: '/aurelius/meditations/:tocSlug' },
  { path: '/meditations/:tocSlug/:translator', redirect: '/aurelius/meditations/:tocSlug/:translator' },
  { path: '/enchirideon', redirect: '/epictetus/enchirideon' },
  { path: '/enchirideon/:tocSlug', redirect: '/epictetus/enchirideon/:tocSlug' },
  { path: '/enchirideon/:tocSlug/:translator', redirect: '/epictetus/enchirideon/:tocSlug/:translator' },

  { path: '/edition/:editionId/info', component: EditionInfo, props: true, name: 'editionInfo' },

  { path: '/', component: AuthorSelect, name: 'authorSelect' },
  { path: '/:author/works', component: WorkSelect, props: true },
  { path: '/:author/:workSlug', component: ContentView, props: true },
  { path: '/:author/:workSlug/:tocSlug', component: ContentView, props: true, name: 'contentByToc' },
  { path: '/:author/:workSlug/:tocSlug/:translator', component: ContentView, props: true },
  // { path: '/workselect', component: WorkSelect }

  /*
  {
      path: '/:catchAll(.*)',
      component: NotFoundComponent,
      name: 'NotFound'
    }
   */
]

const router = new VueRouter({
  mode: 'history',
  routes
})

export default router
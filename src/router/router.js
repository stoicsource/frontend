import Vue from 'vue'
import VueRouter from 'vue-router'
import AuthorSelect from "@/components/AuthorSelect";
import WorkSelect from "@/components/WorkSelect";
import ContentView from "@/components/ContentView";

Vue.use(VueRouter)

const routes = [
  { path: '/', component: AuthorSelect, name: 'authorSelect' },
  { path: '/:author/works', component: WorkSelect, props: true },
  { path: '/:workSlug', component: ContentView, props: true },
  { path: '/:workSlug/:toc', component: ContentView, props: true },
  { path: '/:workSlug/:toc/:translator', component: ContentView, props: true },
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
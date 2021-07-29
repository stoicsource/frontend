import Vue from 'vue'
import VueRouter from 'vue-router'
import App from "@/App";
// import WorkSelect from "@/components/WorkSelect";

Vue.use(VueRouter)

const routes = [
  { path: '/:work', component: App },
  { path: '/:work/:toc', component: App },
  { path: '/:work/:toc/:translator', component: App },
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
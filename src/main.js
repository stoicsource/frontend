import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import { BootstrapVue } from 'bootstrap-vue'
import vSelect from "vue-select";

import store from '@/store/store'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import "vue-select/dist/vue-select.css";

Vue.use(VueRouter)
Vue.use(BootstrapVue)
Vue.component("v-select", vSelect);

Vue.config.productionTip = false


const routes = [
  { path: '/:work', component: App },
  { path: '/:work/:chapter', component: App },
  { path: '/:work/:chapter/:translator', component: App }

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

new Vue({
  store,
  router,
  render: h => h(App),
}).$mount('#app')

import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import { BootstrapVue } from 'bootstrap-vue'
import vSelect from "vue-select";
import store from '@/store/store'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faAngleUp, faAngleDown, faArrowAltCircleDown, faArrowAltCircleUp, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import "vue-select/dist/vue-select.css";

library.add(faAngleUp)
library.add(faAngleDown)
library.add(faArrowAltCircleDown)
library.add(faArrowAltCircleUp)
library.add(faTimesCircle)

Vue.use(VueRouter)
Vue.use(BootstrapVue)
Vue.component("v-select", vSelect);
Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false


const routes = [
  { path: '/:work', component: App },
  { path: '/:work/:toc', component: App },
  { path: '/:work/:toc/:translator', component: App }

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

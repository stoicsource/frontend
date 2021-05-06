import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import { BootstrapVue } from 'bootstrap-vue'
import vSelect from "vue-select";

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import "vue-select/dist/vue-select.css";

Vue.use(VueRouter)

Vue.use(BootstrapVue)
Vue.component("v-select", vSelect);

Vue.config.productionTip = false

let router = new VueRouter();

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')

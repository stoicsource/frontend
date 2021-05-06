import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
// import { MdSelect } from 'vue-material/dist/components'
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'

Vue.use(VueRouter)
Vue.use(VueMaterial)

Vue.config.productionTip = false

let router = new VueRouter();

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')

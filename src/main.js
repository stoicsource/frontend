import Vue from 'vue'
import App from './App.vue'
import { CardPlugin, NavbarPlugin, OverlayPlugin, FormCheckboxPlugin, SpinnerPlugin, ModalPlugin, ButtonPlugin, TabsPlugin } from 'bootstrap-vue'
import vSelect from "vue-select";
import store from '@/store/store'
import router from "@/router/router";
import { library } from '@fortawesome/fontawesome-svg-core'
import { faAngleUp, faAngleDown, faArrowAltCircleDown, faArrowAltCircleUp, faTimesCircle, faBookOpen } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import "vue-select/dist/vue-select.css";

import "./sass/app.scss"

library.add(faAngleUp)
library.add(faAngleDown)
library.add(faArrowAltCircleDown)
library.add(faArrowAltCircleUp)
library.add(faTimesCircle)
library.add(faBookOpen)

Vue.use(CardPlugin)
Vue.use(NavbarPlugin)
Vue.use(OverlayPlugin)
Vue.use(FormCheckboxPlugin)
Vue.use(SpinnerPlugin)
Vue.use(ModalPlugin)
Vue.use(ButtonPlugin)
Vue.use(TabsPlugin)

Vue.component("v-select", vSelect);
Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false

new Vue({
  store,
  router,
  render: h => h(App),
}).$mount('#app')

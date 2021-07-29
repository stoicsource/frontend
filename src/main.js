import Vue from 'vue'
import App from './App.vue'
import { CardPlugin, CollapsePlugin, OverlayPlugin, FormCheckboxPlugin, SpinnerPlugin, ModalPlugin, ButtonPlugin } from 'bootstrap-vue'
import vSelect from "vue-select";
import store from '@/store/store'
import router from "@/router/router";
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

Vue.use(CardPlugin)
Vue.use(CollapsePlugin)
Vue.use(OverlayPlugin)
Vue.use(FormCheckboxPlugin)
Vue.use(SpinnerPlugin)
Vue.use(ModalPlugin)
Vue.use(ButtonPlugin)

Vue.component("v-select", vSelect);
Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false

new Vue({
  store,
  router,
  render: h => h(App),
}).$mount('#app')

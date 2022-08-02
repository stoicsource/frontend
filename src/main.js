import Vue from 'vue'
import App from './App.vue'
import vSelect from "vue-select";
import store from '@/store/store'
import router from "@/router/router";
import 'bootstrap';

import { library } from '@fortawesome/fontawesome-svg-core'
// https://fontawesome.com/v5.15/icons?d=gallery&p=2&m=free
import { faArrowAltCircleDown, faArrowAltCircleUp, faBars, faList, faRandom, faInfoCircle, faShareAlt, faUpRightFromSquare, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import "vue-select/dist/vue-select.css";

import "./sass/app.scss"

library.add(faArrowAltCircleDown)
library.add(faArrowAltCircleUp)
library.add(faBars)
library.add(faList)
library.add(faRandom)
library.add(faInfoCircle)
library.add(faShareAlt)
library.add(faUpRightFromSquare)
library.add(faXmark)

Vue.component("v-select", vSelect);
Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false

new Vue({
  store,
  router,
  render: h => h(App),
}).$mount('#app')

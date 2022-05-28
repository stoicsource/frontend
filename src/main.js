import Vue from 'vue'
import App from './App.vue'
import vSelect from "vue-select";
import store from '@/store/store'
import router from "@/router/router";
import 'bootstrap';

import { library } from '@fortawesome/fontawesome-svg-core'
// https://fontawesome.com/v5.15/icons?d=gallery&p=2&m=free
import {faAngleUp, faAngleDown, faArrowAltCircleDown, faArrowAltCircleUp, faTimesCircle, faBars, faQuoteRight, faCommentAlt, faLink, faList} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import "vue-select/dist/vue-select.css";

import "./sass/app.scss"

library.add(faAngleUp)
library.add(faAngleDown)
library.add(faArrowAltCircleDown)
library.add(faArrowAltCircleUp)
library.add(faTimesCircle)
library.add(faBars)
library.add(faQuoteRight)
library.add(faCommentAlt)
library.add(faLink)
library.add(faList)

Vue.component("v-select", vSelect);
Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false

new Vue({
  store,
  router,
  render: h => h(App),
}).$mount('#app')

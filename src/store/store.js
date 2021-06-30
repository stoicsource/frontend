import Vue from "vue";
import Vuex from 'vuex'
import VuexORM from '@vuex-orm/core'
import axios from 'axios'
import VuexORMAxios from '@vuex-orm/plugin-axios'
import Work from '@/store/models/Work'
import Edition from '@/store/models/Edition'

VuexORM.use(VuexORMAxios, { axios })

Vue.use(Vuex)

const database = new VuexORM.Database()

database.register(Work)
database.register(Edition)

const store = new Vuex.Store({
  plugins: [VuexORM.install(database)]
})

export default store
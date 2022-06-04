import Vue from "vue";
import Vuex from 'vuex'
import VuexORM from '@vuex-orm/core'
import axios from 'axios'
import VuexORMAxios from '@vuex-orm/plugin-axios'
import MainModule from '@/store/modules/MainModule'
import Work from '@/store/models/Work'
import Edition from '@/store/models/Edition'
import TocEntry from "@/store/models/TocEntry";
import Author from "@/store/models/Author";
import Content from "@/store/models/Content";
import SelectionInfo from "@/store/models/SelectionInfo";

VuexORM.use(VuexORMAxios, { axios })

Vue.use(Vuex)

const database = new VuexORM.Database()

database.register(Work)
database.register(Edition)
database.register(TocEntry)
database.register(Author)
database.register(Content)
database.register(SelectionInfo)

const store = new Vuex.Store({
  plugins: [VuexORM.install(database)],
  modules: { app: MainModule }
})

export default store
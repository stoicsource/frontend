import WorkService from "@/services/WorkService";

const mainModule = {
  namespaced: true,
  state: {
    activeWork: null
  },
  getters: {
  },
  actions: {},
  mutations: {
    setActiveWork (state, work) {
      state.activeWork = work;

      if (!state.activeWork || state.activeWork.id !== work.id) {
        WorkService.workSelectDefaults(work);
      }
    }
  }
};

export default mainModule;

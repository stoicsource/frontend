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
      if (!state.activeWork || state.activeWork.id !== work.id) {
        state.activeWork = work;

        WorkService.workSelectDefaults(work);
      }
    }
  }
};

export default mainModule;

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
    }
  }
};

export default mainModule;

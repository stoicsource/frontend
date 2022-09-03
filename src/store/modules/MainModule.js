const mainModule = {
  namespaced: true,
  state: {
    activeWork: null,
    loading: false
  },
  getters: {
  },
  actions: {},
  mutations: {
    setActiveWork (state, work) {
      state.activeWork = work;
    },

    setLoading (state, loading) {
      state.loading = loading;
    }
  }
};

export default mainModule;

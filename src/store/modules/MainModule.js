const mainModule = {
  namespaced: true,
  state: {
    selectedWork: 1
  },
  actions: {

  },
  mutations: {
    setSelectedWork (state, selectedWork) {
      state.selectedWork = selectedWork;
    }
  }
};

export default mainModule;

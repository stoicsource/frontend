const mainModule = {
  namespaced: true,
  state: {
    selectedWorkId: null
  },
  actions: {

  },
  mutations: {
    setSelectedWorkId (state, selectedWorkId) {
      state.selectedWorkId = selectedWorkId;
    }
  }
};

export default mainModule;

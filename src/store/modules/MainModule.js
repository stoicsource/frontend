const mainModule = {
  namespaced: true,
  state: {
    selectedWorkId: null
  },
  actions: {

  },
  mutations: {
    setSelectedWorkId (state, selectedWorkId) {
      selectedWorkId.name = selectedWorkId.name + '-mod';
      state.selectedWorkId = selectedWorkId.id;
    }
  }
};

export default mainModule;

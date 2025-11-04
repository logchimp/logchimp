const state = {
  alert: []
};

const getters = {
  getAlerts: state => state.alert
};

const mutations = {
  add(state, payload) {
    const alertObject = {
      title: payload.title,
      type: payload.type,
      time: Date.now(),
      timeout: payload.timeout
    };

    state.alert.push(alertObject);
  },
  remove(state, payload) {
    state.alert.splice(payload, 1);
  }
};

const actions = {
  add: ({ commit }, payload) => {
    commit("add", {
      title: payload.title,
      type: payload.type,
      timeout: payload.timeout
    });
  },
  remove: ({ commit }, payload) => {
    commit("remove", payload);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};

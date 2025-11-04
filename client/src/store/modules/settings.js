const state = {
  title: "",
  description: "",
  logo: "",
  icon: "",
  accentColor: "",
  googleAnalyticsId: "",
  isPoweredBy: true,
  allowSignup: true,
  developer_mode: false,
  labs: {}
};

const getters = {
  get: state => state,
  labs: state => state.labs
};

const mutations = {
  update(state, payload) {
    state.accentColor = payload.accentColor;
    state.description = payload.description;
    state.icon = payload.icon;
    state.isPoweredBy = payload.isPoweredBy;
    state.logo = payload.logo;
    state.title = payload.title;
    state.googleAnalyticsId = payload.googleAnalyticsId;
    state.allowSignup = payload.allowSignup;
    state.developer_mode = payload.developer_mode;
    state.labs = payload.labs;

    localStorage.setItem("settings", JSON.stringify(payload));
  }
};

const actions = {
  update: ({ commit }, payload) => {
    commit("update", {
      ...state,
      ...payload
    });
  },
  updateLogo: ({ state, commit }, payload) => {
    commit("update", {
      ...state,
      logo: payload.logo
    });
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};

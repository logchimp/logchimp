const state = {
	title: "",
	description: "",
	logo: "",
	icon: "",
	accentColor: "",
	isPoweredBy: true
};

const getters = {
	get: state => state
};

const mutations = {
	update(state, payload) {
		state.accentColor = payload.accentColor;
		state.description = payload.description;
		state.icon = payload.icon;
		state.isPoweredBy = payload.isPoweredBy;
		state.logo = payload.logo;
		state.title = payload.title;

		localStorage.setItem("settings", JSON.stringify(payload));
	}
};

const actions = {
	update: ({ commit }, payload) => {
		commit("update", payload);
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

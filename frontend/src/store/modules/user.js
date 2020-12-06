const state = {
	authToken: "",
	userId: "",
	email: "",
	avatar: ""
};

const getters = {
	getUser: state => state,
	getUserId: state => state.userId,
	getAuthToken: state => state.authToken
};

const mutations = {
	setUser(state, payload) {
		state.authToken = payload.authToken;
		state.userId = payload.userId;
		state.email = payload.email;
		state.avatar = payload.avatar;

		localStorage.setItem("user", JSON.stringify(payload));
	}
};

const actions = {
	login: ({ commit }, payload) => {
		commit("setUser", payload);
	},
	logout: ({ state, commit }) => {
		commit("setUser", state);
		localStorage.removeItem("user");
	},
	updateUserSettings: ({ state, commit }, payload) => {
		commit("setUser", {
			...state,
			...payload
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

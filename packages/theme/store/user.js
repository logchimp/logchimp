export const state = () => ({
	authToken: "",
	userId: "",
	name: "",
	username: "",
	email: "",
	avatar: "",
	permissions: []
});

export const getters = {
	getUser: (state) => state,
	getUserId: (state) => state.userId,
	getAuthToken: (state) => state.authToken,
	getPermissions: (state) => state.permissions
};

export const mutations = {
	setUser(state, payload) {
		state.authToken = payload.authToken;
		state.userId = payload.userId;
		state.name = payload.name;
		state.username = payload.username;
		state.email = payload.email;
		state.avatar = payload.avatar;

		localStorage.setItem("user", JSON.stringify(payload));
	},
	setPermissions(state, payload) {
		state.permissions = payload.permissions;
	}
};

export const actions = {
	login: ({ commit }, payload) => {
		commit("setUser", payload);
	},
	logout: ({ commit }) => {
		commit("setUser", {});

		// reset permissions state
		commit("setPermissions", {
			permissions: []
		});
	},
	updateUserSettings: ({ state, commit }, payload) => {
		commit("setUser", {
			...state,
			...payload
		});
	}
};

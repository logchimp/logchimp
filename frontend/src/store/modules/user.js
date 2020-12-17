// modules
import { getPermissions } from "../../modules/users";

const state = {
	authToken: "",
	userId: "",
	name: "",
	email: "",
	avatar: "",
	roles: [],
	permissions: []
};

const getters = {
	getUser: state => state,
	getUserId: state => state.userId,
	getAuthToken: state => state.authToken,
	getPermissions: state => state.permissions,
	getRoles: state => state.roles
};

const mutations = {
	setUser(state, payload) {
		state.authToken = payload.authToken;
		state.userId = payload.userId;
		state.name = payload.name;
		state.email = payload.email;
		state.avatar = payload.avatar;

		localStorage.setItem("user", JSON.stringify(payload));
	},
	setPermissions(state, payload) {
		state.roles = payload.roles;
		state.permissions = payload.permissions;
	}
};

const actions = {
	login: ({ commit }, payload) => {
		commit("setUser", payload);
	},
	logout: ({ commit }) => {
		commit("setUser", {});

		// reset roles/permissions state
		commit("setPermissions", {
			roles: [],
			permissions: []
		});
		localStorage.removeItem("user");
	},
	updateUserSettings: ({ state, commit }, payload) => {
		commit("setUser", {
			...state,
			...payload
		});
	},
	updatePermissions: async ({ commit }) => {
		const response = await getPermissions();

		commit("setPermissions", response.data);
	}
};

export default {
	namespaced: true,
	state,
	getters,
	mutations,
	actions
};

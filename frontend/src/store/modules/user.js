// modules
import { getPermissions } from "../../modules/users";

// utils
import tokenError from "../../utils/tokenError";

const state = {
	authToken: "",
	userId: "",
	name: "",
	username: "",
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
		state.username = payload.username;
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
		try {
			const response = await getPermissions();
			commit("setPermissions", response.data);
		} catch (error) {
			tokenError(error);
		}
	}
};

export default {
	namespaced: true,
	state,
	getters,
	mutations,
	actions
};

const state = {
	authToken: "",
	userId: "",
	firstname: "",
	lastname: "",
	emailAddress: "",
	username: "",
	avatar: "",
	isVerified: false,
	isBlocked: false,
	isModerator: false,
	isOwner: false,
	createdAt: "",
	updatedAt: ""
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
		state.firstname = payload.firstname;
		state.lastname = payload.lastname;
		state.emailAddress = payload.emailAddress;
		state.username = payload.username;
		state.avatar = payload.avatar;
		state.isVerified = payload.isVerified;
		state.isBlocked = payload.isBlocked;
		state.isModerator = payload.isModerator;
		state.isOwner = payload.isOwner;
		state.createdAt = payload.createdAt;
		state.updatedAt = payload.updatedAt;

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

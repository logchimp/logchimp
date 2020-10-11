export const state = () => ({
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
	isOwner: false
});

export const getters = {
	getUser: state => state,
	getUserId: state => state.userId,
	getAuthToken: state => state.authToken
};

export const mutations = {
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

		localStorage.setItem("user", JSON.stringify(payload));
	}
};

export const actions = {
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

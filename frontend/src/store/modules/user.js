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

		localStorage.setItem(
			"user",
			JSON.stringify({
				authToken: payload.authToken,
				userId: payload.userId,
				firstname: payload.firstname,
				lastname: payload.lastname,
				emailAddress: payload.emailAddress,
				username: payload.username,
				avatar: payload.avatar,
				isVerified: payload.isVerified,
				isBlocked: payload.isBlocked,
				isModerator: payload.isModerator,
				isOwner: payload.isOwner,
				createdAt: payload.createdAt,
				updatedAt: payload.updatedAt
			})
		);
	}
};

const actions = {
	login: ({ commit }, payload) => {
		commit({
			type: "setUser",
			authToken: payload.authToken,
			userId: payload.userId,
			firstname: payload.firstname,
			lastname: payload.lastname,
			emailAddress: payload.emailAddress,
			username: payload.username,
			avatar: payload.avatar,
			isVerified: payload.isVerified,
			isBlocked: payload.isBlocked,
			isModerator: payload.isModerator,
			isOwner: payload.isOwner,
			createdAt: payload.createdAt,
			updatedAt: payload.updatedAt
		});
	},
	logout: ({ commit }) => {
		commit({
			type: "setUser",
			authToken: "",
			userId: "",
			firstname: "",
			lastname: "",
			emailAddress: "",
			username: "",
			avatar: "",
			isVerified: "",
			isBlocked: "",
			isModerator: "",
			isOwner: "",
			createdAt: "",
			updatedAt: ""
		});
		localStorage.removeItem("user");
	}
};

export default {
	namespaced: true,
	state,
	getters,
	mutations,
	actions
};

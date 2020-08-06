const state = {
	authToken: "",
	memberId: "",
	firstName: "",
	lastName: "",
	emailAddress: "",
	profilePicture: "",
	isVerified: false,
	isBlocked: false,
	isModerator: false,
	isOwner: false,
	createdAt: "",
	updatedAt: ""
};

const getters = {
	getMember: state => state,
	getAuthToken: state => state.authToken
};

const mutations = {
	setMember(state, payload) {
		state.authToken = payload.authToken;
		state.memberId = payload.memberId;
		state.firstName = payload.firstName;
		state.lastName = payload.lastName;
		state.emailAddress = payload.emailAddress;
		state.profilePicture = payload.profilePicture;
		state.isVerified = payload.isVerified;
		state.isBlocked = payload.isBlocked;
		state.isModerator = payload.isModerator;
		state.isOwner = payload.isOwner;
		state.createdAt = payload.createdAt;
		state.updatedAt = payload.updatedAt;

		localStorage.setItem(
			"member",
			JSON.stringify({
				authToken: payload.authToken,
				memberId: payload.memberId,
				firstName: payload.firstName,
				lastName: payload.lastName,
				emailAddress: payload.emailAddress,
				profilePicture: payload.profilePicture,
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
			type: "setMember",
			authToken: payload.authToken,
			memberId: payload.memberId,
			firstName: payload.firstName,
			lastName: payload.lastName,
			emailAddress: payload.emailAddress,
			profilePicture: payload.profilePicture,
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
			type: "setMember",
			authToken: "",
			memberId: "",
			firstName: "",
			lastName: "",
			emailAddress: "",
			profilePicture: "",
			isVerified: "",
			isBlocked: "",
			isModerator: "",
			isOwner: "",
			createdAt: "",
			updatedAt: ""
		});
		localStorage.removeItem("member");
	}
};

export default {
	namespaced: true,
	state,
	getters,
	mutations,
	actions
};

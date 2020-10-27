// packges
import axios from "axios";

// store
import store from "../store";

/**
 * Add vote to a post
 *
 * @param {postId} string post UUID
 */
export const addVote = async postId => {
	const token = store.getters["user/getAuthToken"];
	const userId = store.getters["user/getUserId"];

	return await axios({
		method: "post",
		url: "/api/v1/votes",
		data: {
			userId,
			postId
		},
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
};

/**
 * Delete vote from a post
 *
 * @param {postId} string post UUID
 * @param {voteId} string vote UUID
 */
export const deleteVote = async (postId, voteId) => {
	const token = store.getters["user/getAuthToken"];

	return await axios({
		method: "delete",
		url: "/api/v1/votes",
		data: {
			voteId,
			postId
		},
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
};

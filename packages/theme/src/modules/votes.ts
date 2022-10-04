// packges
import axios from "axios";

// store
import store from "../store";

/**
 * Add vote to a post
 *
 * @param {string} postId post UUID
 *
 * @returns {object} response
 */
export const addVote = async postId => {
  const token = store.getters["user/getAuthToken"];
  const userId = store.getters["user/getUserId"];

  return await axios({
    method: "POST",
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
 * @param {string} postId post UUID
 *
 * @returns {object} response
 */
export const deleteVote = async postId => {
  const userId = store.getters["user/getUserId"];
  const token = store.getters["user/getAuthToken"];

  return await axios({
    method: "DELETE",
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

// packages
import axios from "axios";

// store
import { useUserStore } from "../store/user";

import type { UserType } from "./users";
import { VITE_API_URL } from "../constants";

export interface PostVoteType extends UserType {
  voteId: string;
  postId: string;
  createdAt: string;
}

/**
 * Add vote to a post
 *
 * @param {string} postId post UUID
 *
 * @returns {object} response
 */
export const addVote = async (postId: string) => {
  const { getUserId, authToken } = useUserStore();

  return await axios({
    method: "POST",
    url: `${VITE_API_URL}/api/v1/votes`,
    data: {
      userId: getUserId,
      postId,
    },
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

/**
 * Delete vote from a post
 *
 * @param {string} postId post UUID
 *
 * @returns {object} response
 */
export const deleteVote = async (postId: string) => {
  const { getUserId, authToken } = useUserStore();

  return await axios({
    method: "DELETE",
    url: `${VITE_API_URL}/api/v1/votes`,
    data: {
      userId: getUserId,
      postId,
    },
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

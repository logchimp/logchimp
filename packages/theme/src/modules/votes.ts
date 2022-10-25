// packges
import axios from "axios";

import { useUserStore } from "../store/user";
import { UserType } from "./users";

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
    url: "/api/v1/votes",
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
    url: "/api/v1/votes",
    data: {
      userId: getUserId,
      postId,
    },
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

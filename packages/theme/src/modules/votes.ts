import axios, { type AxiosResponse } from "axios";
import type {
  IAddVoteResponseBody,
  TRemoveVoteResponseBody,
} from "@logchimp/types";

import { useUserStore } from "../store/user";
import { VITE_API_URL } from "../constants";

/**
 * Add vote to a post
 * @param {string} postId post UUID
 * @returns {Promise<AxiosResponse<IAddVoteResponseBody>>} response
 */
export const addVote = async (
  postId: string,
): Promise<AxiosResponse<IAddVoteResponseBody>> => {
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
 * @param {string} postId post UUID
 * @returns {Promise<AxiosResponse<TRemoveVoteResponseBody>>} response
 */
export const deleteVote = async (
  postId: string,
): Promise<AxiosResponse<TRemoveVoteResponseBody>> => {
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

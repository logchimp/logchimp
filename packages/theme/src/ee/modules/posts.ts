import axios, { type AxiosResponse } from "axios";
import type {
  ICreatePostCommentRequestBody,
  ICreatePostCommentResponseBody,
  IGetPostActivityRequestQuery,
  IGetPostActivityResponseBody,
} from "@logchimp/types";

import { VITE_API_URL } from "../../constants";
import { useUserStore } from "../../store/user";

/**
 * Get post activity
 * @param {string} post_id post UUID
 * @param {object} activity
 * @param {string} activity.page page number
 * @param {string} activity.limit number of items in a page
 * @returns {Promise<AxiosResponse<IGetPostActivityResponseBody>>}
 */
export const postActivity = async (
  post_id: string,
  { page, limit }: IGetPostActivityRequestQuery,
): Promise<AxiosResponse<IGetPostActivityResponseBody>> => {
  return await axios({
    method: "GET",
    url: `${VITE_API_URL}/api/v1/posts/${post_id}/activity`,
    params: {
      page,
      limit,
    },
  });
};

/**
 * Add comment to a post
 * @param {string} post_id
 * @param {object} comment
 * @param {string} comment.body
 * @param {boolean} comment.is_internal
 * @returns {Promise<AxiosResponse<ICreatePostCommentResponseBody>>}
 */
export const addComment = async (
  post_id: string,
  { body, is_internal = false }: ICreatePostCommentRequestBody,
): Promise<AxiosResponse<ICreatePostCommentResponseBody>> => {
  const { authToken } = useUserStore();

  return await axios({
    method: "POST",
    url: `${VITE_API_URL}/api/v1/posts/${post_id}/comments`,
    data: {
      body,
      is_internal,
    },
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

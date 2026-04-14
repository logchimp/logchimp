import axios, { type AxiosResponse } from "axios";
import type {
  IAddVoteV2ResponseBody,
  ICreatePostCommentRequestBody,
  ICreatePostCommentResponseBody,
  IGetPostActivityRequestQuery,
  IGetPostActivityResponseBody,
  TFilterPostActivityVisibility,
} from "@logchimp/types";

import { VITE_API_URL } from "../../constants";
import { useUserStore } from "../../store/user";
import { APIService } from "../../modules/api";

export class PostsEE extends APIService {
  constructor(baseURL?: string) {
    super(baseURL || `${VITE_API_URL}/api`);
  }

  async castVoteOnBehalf(
    postId: string,
    userId: string,
  ): Promise<IAddVoteV2ResponseBody> {
    return this.post(`/v1/posts/${postId}/votes/${userId}`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  }

  async retactVoteOnBehalf(postId: string, userId: string) {
    return this.delete(`/v1/posts/${postId}/votes/${userId}`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  }
}

/**
 * Get post activity
 * @param {string} post_id post UUID
 * @param {object} activity
 * @param {string} activity.page page number
 * @param {string} activity.limit number of items in a page
 * @param {string[]} activity.visibility visibility of the activity
 * @returns {Promise<AxiosResponse<IGetPostActivityResponseBody>>}
 */
export const postActivity = async (
  post_id: string,
  {
    page,
    limit,
    visibility,
  }: Omit<IGetPostActivityRequestQuery, "visibility"> & {
    visibility: Array<TFilterPostActivityVisibility>;
  },
): Promise<AxiosResponse<IGetPostActivityResponseBody>> => {
  const { authToken } = useUserStore();

  return await axios({
    method: "GET",
    url: `${VITE_API_URL}/api/v1/posts/${encodeURIComponent(post_id)}/activity`,
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    params: {
      page,
      limit,
      visibility: visibility.join(","),
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
    url: `${VITE_API_URL}/api/v1/posts/${encodeURIComponent(post_id)}/comments`,
    data: {
      body,
      is_internal,
    },
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

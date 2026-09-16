import type { AxiosResponse } from "axios";
import type {
  IAddVoteV2ResponseBody,
  ICreatePostCommentRequestBody,
  ICreatePostCommentResponseBody,
  IGetPostActivityRequestQuery,
  IGetPostActivityResponseBody,
  IUpdatePostCommentRequestBody,
  IUpdatePostCommentResponseBody,
  TFilterPostActivityVisibility,
} from "@logchimp/types";

import { VITE_API_URL } from "../../constants";
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

  /**
   * Get post activity
   * @param {string} post_id post UUID
   * @param {object} activity
   * @param {string} activity.page page number
   * @param {string} activity.limit number of items in a page
   * @param {string[]} activity.visibility visibility of the activity
   * @returns {Promise<IGetPostActivityResponseBody>}
   */
  GetPostActivities = async (
    post_id: string,
    {
      page,
      limit,
      visibility,
    }: Omit<IGetPostActivityRequestQuery, "visibility"> & {
      visibility: Array<TFilterPostActivityVisibility>;
    },
  ): Promise<IGetPostActivityResponseBody> => {
    return this.get(`/v1/posts/${encodeURIComponent(post_id)}/activity`, {
      page,
      limit,
      visibility: visibility.join(","),
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };

  /**
   * Add comment to a post
   * @param {string} post_id
   * @param {object} comment
   * @param {string} comment.body
   * @param {boolean} comment.is_internal
   * @returns {Promise<ICreatePostCommentResponseBody>}
   */
  AddComment = async (
    post_id: string,
    { body, is_internal = false }: ICreatePostCommentRequestBody,
  ): Promise<ICreatePostCommentResponseBody> => {
    return this.post(`v1/posts/${encodeURIComponent(post_id)}/comments`, {
      body,
      is_internal,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };

  UpdateComment = async (
    post_id: string,
    comment_id: string,
    { body, is_internal = false }: Partial<IUpdatePostCommentRequestBody>,
  ): Promise<IUpdatePostCommentResponseBody> => {
    return this.put(
      `/v1/posts/${encodeURIComponent(post_id)}/comments/${encodeURIComponent(comment_id)}`,
      {
        body,
        is_internal,
      },
    )
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };

  DeleteComment = async (
    post_id: string,
    comment_id: string,
  ): Promise<AxiosResponse> => {
    return this.delete(
      `/v1/posts/${encodeURIComponent(post_id)}/comments/${encodeURIComponent(comment_id)}`,
    );
  };
}

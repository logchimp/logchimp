import type { AxiosResponse } from "axios";
import type { components, operations } from "@logchimp/api-ts-types";

import { VITE_API_URL } from "../../constants";
import { APIService } from "../../modules/api";

export class PostsEE extends APIService {
  constructor(baseURL?: string) {
    super(baseURL || `${VITE_API_URL}/api`);
  }

  async castVoteOnBehalf(
    postId: string,
    userId: string,
  ): Promise<components["schemas"]["AddVoteOnBehalfOfUserResponseBody"]> {
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
   * @returns {Promise<components["schemas"]["GetPostActivityResponseBody"]>}
   */
  GetPostActivities = async (
    post_id: string,
    {
      page,
      limit,
      visibility,
    }: Omit<
      NonNullable<operations["getPostActivity"]["parameters"]["query"]>,
      "visibility"
    > & {
      visibility?: Array<components["schemas"]["PostActivityVisibilityEnum"]>;
    },
  ): Promise<components["schemas"]["GetPostActivityResponseBody"]> => {
    return this.get(`/v1/posts/${encodeURIComponent(post_id)}/activity`, {
      page,
      limit,
      visibility: visibility ? visibility.join(",") : "",
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };

  /**
   * Add comment to a post
   * @param {string} post_id
   * @param {components["schemas"]["CreatePostCommentRequestBody"]} comment
   * @param {string} comment.body
   * @param {boolean} comment.is_internal
   * @returns {Promise<components['schemas']['CreatePostCommentResponseBody']>}
   */
  AddComment = async (
    post_id: string,
    {
      body,
      is_internal = false,
    }: components["schemas"]["CreatePostCommentRequestBody"],
  ): Promise<components["schemas"]["CreatePostCommentResponseBody"]> => {
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
    {
      body,
      is_internal = false,
    }: Partial<components["schemas"]["UpdatePostCommentRequestBody"]>,
  ): Promise<components["schemas"]["UpdatePostCommentResponseBody"]> => {
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

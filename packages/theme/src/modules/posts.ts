import type { AxiosRequestConfig } from "axios";
import type { components, operations } from "@logchimp/api-ts-types";

import { VITE_API_URL } from "../constants";
import { useUserStore } from "../store/user";
import { APIService } from "./api.ts";

export class PostsAPI extends APIService {
  constructor(baseURL?: string) {
    super(baseURL || `${VITE_API_URL}/api`);
  }

  /**
   * Get posts
   * @param body
   * @param query
   * @param config
   * @returns {Promise<components['schemas']['GetFilterPostResponseBody']>} response
   */
  async GetPosts(
    body: components["schemas"]["GetFilterPostRequestBody"],
    query?: operations["filterPosts"]["parameters"]["query"],
    config: AxiosRequestConfig = {},
  ): Promise<components["schemas"]["GetFilterPostResponseBody"]> {
    const searchParams = this.buildQueryParams(query);

    const url = `/v1/posts/get?${searchParams.toString()}`;

    return this.post(
      url.toString(),
      {
        query: body.query,
        page: body.page,
        boardId: body.boardId,
        roadmapId: body.roadmapId,
      },
      config,
    )
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  }

  async GetPostVotes(
    postId: string,
    params: operations["getPostVotes"]["parameters"]["query"] = {},
  ): Promise<components["schemas"]["GetPostVotesResponseBody"]> {
    const searchParams = this.buildQueryParams(params);

    const url = `/v1/posts/${postId}/votes?${searchParams.toString()}`;

    return this.get(url)
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  }

  /**
   * Create post
   * @param {object} post create post args
   * @param {string} post.boardId board UUID
   * @param {string} post.title
   * @param {string} post.description
   * @returns {Promise<components["schemas"]["CreatePostResponseBody"]>} response
   */
  CreatePost = async (
    post: components["schemas"]["CreatePostEERequestBody"],
  ): Promise<components["schemas"]["CreatePostResponseBody"]> => {
    const { getUserId } = useUserStore();

    return this.post("/v1/posts", {
      title: post.title,
      contentMarkdown: post.contentMarkdown,
      userId: getUserId,
      boardId: post.boardId,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };

  /**
   * Get post by slug
   * @param {string} slug post slug
   * @returns {Promise<components['schemas']['GetPostBySlugResponseBody']>} response
   */
  GetPostBySlug = async (
    slug: string,
  ): Promise<components["schemas"]["GetPostBySlugResponseBody"]> => {
    return this.post("/v1/posts/slug", {
      slug,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };

  /**
   * Update post
   * @param {object} post update post data
   * @param {string} post.id post UUID
   * @param {string} post.title post title
   * @param {string} post.contentMarkdown post body in markdown format
   * @param {string} post.slugId post slug UUID
   * @param {string} post.userId post author UUID
   * @param {string} post.boardId post board UUID
   * @param {string} post.roadmapId post roadmap UUID
   * @returns {Promise<components["schemas"]["UpdatePostResponseBody"]>} response
   */
  UpdatePost = async (
    post: components["schemas"]["UpdatePostEERequestBody"],
  ): Promise<components["schemas"]["UpdatePostResponseBody"]> => {
    return this.patch("/v1/posts", post)
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };
}

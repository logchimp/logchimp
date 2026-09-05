// packages
import axios, { type AxiosResponse } from "axios";
import type {
  ICreatePostRequestBody,
  ICreatePostResponseBody,
  IFilterPostRequestBody,
  IFilterPostRequestQueryParams,
  IFilterPostResponseBody,
  IGetPostBySlugResponseBody,
  IGetPostVotesRequestQuery,
  IPaginatedPostVotesResponse,
  IUpdatePostRequestBody,
  TUpdatePostResponseBody,
} from "@logchimp/types";

import { VITE_API_URL } from "../constants";
import { useUserStore } from "../store/user";
import { APIService } from "./api.ts";

export class Posts extends APIService {
  constructor(baseURL?: string) {
    super(baseURL || `${VITE_API_URL}/api`);
  }

  /**
   * Get posts
   * @param body
   * @param query
   * @returns {Promise<AxiosResponse<IFilterPostResponseBody>>} response
   */
  async GetPosts(
    body: IFilterPostRequestBody,
    query?: IFilterPostRequestQueryParams,
  ): Promise<IFilterPostResponseBody> {
    const searchParams = new URLSearchParams();
    for (const queryKey in query) {
      const value = query[queryKey as keyof IGetPostVotesRequestQuery];
      if (value) {
        searchParams.set(queryKey, value.toString());
      }
    }

    const url = `/v1/posts/get?${searchParams.toString()}`;

    return this.post(url.toString(), {
      page: body.page,
      boardId: body.boardId,
      roadmapId: body.roadmapId,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  }

  async getPostVotes(
    postId: string,
    params: IGetPostVotesRequestQuery = {},
  ): Promise<IPaginatedPostVotesResponse> {
    const searchParams = new URLSearchParams();

    for (const paramsKey in params) {
      const value = params[paramsKey as keyof IGetPostVotesRequestQuery];
      if (value) {
        searchParams.append(paramsKey, value.toString());
      }
    }

    const url = `/v1/posts/${postId}/votes${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;

    return this.get(url)
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  }
}

/**
 * Create post
 * @param {object} post create post args
 * @param {string} post.boardId board UUID
 * @param {string} post.title
 * @param {string} post.description
 * @returns {Promise<AxiosResponse<ICreatePostResponseBody>>} response
 */
export const createPost = async (
  post: ICreatePostRequestBody,
): Promise<AxiosResponse<ICreatePostResponseBody>> => {
  const { getUserId, authToken } = useUserStore();

  return await axios({
    method: "POST",
    url: `${VITE_API_URL}/api/v1/posts`,
    data: {
      title: post.title,
      contentMarkdown: post.contentMarkdown,
      userId: getUserId,
      boardId: post.boardId,
    },
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

/**
 * Get post by slug
 * @param {string} slug post slug
 * @returns {Promise<AxiosResponse<IGetPostBySlugResponseBody>>} response
 */
export const getPostBySlug = async (
  slug: string,
): Promise<AxiosResponse<IGetPostBySlugResponseBody>> => {
  const { authToken } = useUserStore();

  return await axios({
    method: "POST",
    url: `${VITE_API_URL}/api/v1/posts/slug`,
    data: {
      slug,
    },
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
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
 * @returns {Promise<AxiosResponse<TUpdatePostResponseBody>>} response
 */
export const updatePost = async (
  post: IUpdatePostRequestBody,
): Promise<AxiosResponse<TUpdatePostResponseBody>> => {
  const { authToken } = useUserStore();

  return await axios({
    method: "PATCH",
    url: `${VITE_API_URL}/api/v1/posts`,
    data: {
      ...post,
    },
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

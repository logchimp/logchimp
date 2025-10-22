// packages
import axios, { type AxiosResponse } from "axios";
import type {
  ICreatePostRequestBody,
  ICreatePostResponseBody,
  IFilterPostRequestBody,
  IFilterPostResponseBody,
  IGetPostBySlugResponseBody,
  IUpdatePostRequestBody,
  TUpdatePostResponseBody,
} from "@logchimp/types";

import { VITE_API_URL } from "../constants";
import { useUserStore } from "../store/user";

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
 * Get posts
 * @param {object} arg0
 * @param {number} arg0.page number default to 1
 * @param {number} arg0.limit number of posts to fetch
 * @param {ApiSortType} arg0.created createdAt sort type ASC or DESC
 * @param {string[]} arg0.boardId array of board UUIDs
 * @param {string} arg0.roadmapId array of roadmap UUIDs
 * @returns {Promise<AxiosResponse<IFilterPostResponseBody>>} response
 */
export const getPosts = async ({
  page = "1",
  limit = "10",
  created = "DESC",
  boardId = [],
  roadmapId = undefined,
  after = undefined,
}: IFilterPostRequestBody): Promise<AxiosResponse<IFilterPostResponseBody>> => {
  const { authToken } = useUserStore();

  return await axios({
    method: "POST",
    url: `${VITE_API_URL}/api/v1/posts/get`,
    data: {
      page,
      limit,
      created,
      boardId,
      roadmapId,
      after,
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

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

// store
import { useUserStore } from "../store/user";

export interface PostType {
  postId: string;
  title: string;
  slug: string;
  slugId: string;
  contentMarkdown?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create post
 * @param {string} boardId board UUID
 * @param {object} post create post args
 * @param {string} post.title
 * @param {string} post.description
 * @returns {Promise<AxiosResponse<ICreatePostResponseBody>>} response
 */
export const createPost = async (
  boardId: string,
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
      boardId,
    },
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

/**
 * Get posts
 *
 * @param {number} page number default to 1
 * @param {number} limit number of posts to fetch
 * @param {ApiSortType} created createdAt sort type ASC or DESC
 * @param {string} userId logged in user UUID
 * @param {string[]} boardId array of board UUIDs
 * @param {string} roadmapId array of roadmap UUIDs
 * @returns {Promise<AxiosResponse<IFilterPostResponseBody>>} response
 */
export const getPosts = async ({
  page = "1",
  limit = 10,
  created = "DESC",
  boardId = [],
  roadmapId = "",
}: IFilterPostRequestBody): Promise<AxiosResponse<IFilterPostResponseBody>> => {
  const { getUserId } = useUserStore();

  return await axios({
    method: "POST",
    url: `${VITE_API_URL}/api/v1/posts/get`,
    data: {
      page,
      limit,
      created,
      userId: getUserId,
      boardId,
      roadmapId,
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
  const { getUserId } = useUserStore();

  return await axios({
    method: "POST",
    url: `${VITE_API_URL}/api/v1/posts/slug`,
    data: {
      slug,
      userId: getUserId,
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

// packges
import axios from "axios";

// store
import { useUserStore } from "../store/user";
import { ApiPaginationType, ApiSortType } from "../types";

export interface PostType {
  postId: string;
  title: string;
  slug: string;
  slugId: string;
  contentMarkdown?: string;
  createdAt: string;
  updatedAt: string;
}

interface GetPostArgs extends ApiPaginationType {
  boardId?: string[];
  roadmapId?: string;
}

interface CreatePostArgs {
  title: string;
  contentMarkdown?: string;
}

export interface UpdatePostArgs extends CreatePostArgs {
  id: string;
  slugId: string;
  userId: string;
  boardId?: string;
  roadmapId?: string;
}

interface PostActivityArgs {
  post_id: string;
  sort: ApiSortType;
}

interface AddCommentArgs {
  post_id: string;
  body: string;
  is_internal?: boolean;
}

/**
 * Create post
 *
 * @param {boardId} string board UUID
 * @param {post} object post title and description
 *
 * @returns {object} response
 */
export const createPost = async (boardId: string, post: CreatePostArgs) => {
  const { getUserId, authToken } = useUserStore();

  return await axios({
    method: "POST",
    url: "/api/v1/posts",
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
 * @param {string} sort createdAt sort type ASC or DESC
 * @param {string} userId logged in user UUID
 * @param {string[]} boardId array of board UUIDs
 * @param {string} roadmapId array of roadmap UUIDs
 *
 * @returns {object} response
 */
export const getPosts = async ({
  page = 1,
  limit = 10,
  sort = "DESC",
  boardId = [],
  roadmapId = "",
}: GetPostArgs) => {
  const { getUserId } = useUserStore();

  return await axios({
    method: "POST",
    url: "/api/v1/posts/get",
    data: {
      page,
      limit,
      created: sort,
      userId: getUserId,
      boardId,
      roadmapId,
    },
  });
};

/**
 * Get post by slug
 *
 * @param {slug} string post slug
 *
 * @returns {object} response
 */
export const getPostBySlug = async (slug: string) => {
  const { getUserId } = useUserStore();

  return await axios({
    method: "POST",
    url: "/api/v1/posts/slug",
    data: {
      slug,
      userId: getUserId,
    },
  });
};

/**
 * Update post
 *
 * @param {object} post update post data
 * @param {string} post.id post UUID
 * @param {string} post.title post title
 * @param {string} post.contentMarkdown post body in markdown format
 * @param {string} post.slugId post slug UUID
 * @param {string} post.userId post author UUID
 * @param {string} post.boardId post board UUID
 * @param {string} post.roadmapId post roadmap UUID
 *
 * @returns {object} response
 */
export const updatePost = async (post: UpdatePostArgs) => {
  const { authToken } = useUserStore();

  return await axios({
    method: "PATCH",
    url: "/api/v1/posts",
    data: {
      ...post,
    },
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

/**
 * Get post activity
 *
 * @param {object} activity
 * @param {string} activity.post_id post UUID
 * @param {string} activity.sort sort type
 */
export const postActivity = async ({ post_id, sort }: PostActivityArgs) => {
  return await axios({
    method: "GET",
    url: `/api/v1/posts/${post_id}/activity`,
    params: {
      sort,
    },
  });
};

/**
 * Add comment to a post
 *
 * @param {object} comment
 * @param {string} comment.body
 * @param {boolean} comment.is_internal
 */
export const addComment = async ({
  post_id,
  body,
  is_internal = false,
}: AddCommentArgs) => {
  const { authToken } = useUserStore();

  return await axios({
    method: "POST",
    url: `/api/v1/posts/${post_id}/comments`,
    data: {
      body,
      is_internal,
    },
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

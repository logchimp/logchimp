import axios from "axios";
import type { ApiSortType } from "@logchimp/types";

import { VITE_API_URL } from "../../constants";

// store
import { useUserStore } from "../../store/user";

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
 * Get post activity
 *
 * @param {object} activity
 * @param {string} activity.post_id post UUID
 * @param {string} activity.sort sort type
 */
export const postActivity = async ({ post_id, sort }: PostActivityArgs) => {
  return await axios({
    method: "GET",
    url: `${VITE_API_URL}/api/v1/posts/${post_id}/activity`,
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

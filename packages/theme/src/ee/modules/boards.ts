// packages
import axios from "axios";

import { VITE_API_URL } from "../../constants";

// store
import { useUserStore } from "../../store/user";
import type { ApiPaginationType } from "../../types";

interface CreateBoardArgs {
  name?: string;
  display?: boolean;
}

export interface Board {
  boardId: string;
  name: string;
  url: string;
  color: string;
}

interface UpdateBoardArgs extends Board {
  view_voters: boolean;
  display: boolean;
}

/**
 *	Get public boards
 *
 * @param {number} page page number default to 1
 * @param {string} sort sort type asc or desc
 *
 * @returns {object} response
 */
export const getPublicBoards = async ({
  page = 1,
  limit,
  sort = "DESC",
}: ApiPaginationType) => {
  return await axios({
    method: "GET",
    url: `${VITE_API_URL}/api/v1/boards`,
    params: {
      page,
      limit,
      created: sort,
    },
  });
};

/**
 *	Get all boards
 *
 * @param {number} page page number default to 1
 * @param {string} sort sort type asc or desc
 *
 * @returns {object} response
 */
export const getAllBoards = async ({
  page = 1,
  limit,
  sort = "DESC",
}: ApiPaginationType) => {
  return await axios({
    method: "GET",
    url: `${VITE_API_URL}/api/v1/boards/get`,
    params: {
      page,
      limit,
      created: sort,
    },
  });
};

/**
 *	Get board by URL
 *
 * @param {string} url board url
 *
 * @returns {object} response
 */
export const getBoardByUrl = async (url: string) => {
  return await axios({
    method: "GET",
    url: `${VITE_API_URL}/api/v1/boards/${url}`,
  });
};

/**
 * Search board by name
 *
 * @param {string} name board name
 *
 * @returns {object} response
 */
export const searchBoard = async (name: string) => {
  const { authToken } = useUserStore();

  return await axios({
    method: "GET",
    url: `${VITE_API_URL}/api/v1/boards/search/${name}`,
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

/**
 * Create new board
 *
 * @returns {object} response
 */
export const createBoard = async ({ name, display }: CreateBoardArgs) => {
  const { authToken } = useUserStore();

  return await axios({
    method: "POST",
    url: `${VITE_API_URL}/api/v1/boards`,
    data: {
      name,
      display,
    },
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

/**
 * Update board
 *
 * @param {object} board update board data
 * @param {string} board.name board name
 * @param {string} board.url board url
 * @param {string} board.color board color
 * @param {boolean} board.view_voters view voters in this board
 * @param {boolean} board.display display board on the site
 *
 * @returns {object} response
 */
export const updateBoard = async (board: UpdateBoardArgs) => {
  const { authToken } = useUserStore();

  return await axios({
    method: "PATCH",
    url: `${VITE_API_URL}/api/v1/boards`,
    data: {
      ...board,
    },
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

/**
 * delete board
 *
 * @param {string} id board id
 *
 * @returns {object} response
 */
export const deleteBoard = async (id: string) => {
  const { authToken } = useUserStore();

  return await axios({
    method: "DELETE",
    url: `${VITE_API_URL}/api/v1/boards`,
    data: {
      id,
    },
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

/**
 * Check board name
 *
 * @param {string} name board name
 *
 * @returns {object} response
 */
export const checkBoardName = async (name: string) => {
  const { authToken } = useUserStore();

  return await axios({
    method: "POST",
    url: `${VITE_API_URL}/api/v1/boards/check-name`,
    data: {
      name,
    },
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

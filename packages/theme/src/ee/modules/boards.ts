// packages
import axios, { type AxiosResponse } from "axios";
import type {
  ApiPaginationType,
  IBoard,
  TBoardCheckNameResponse,
  TBoardCreateBody,
  TBoardUpdateBody,
} from "@logchimp/types";

import { VITE_API_URL } from "../../constants";

// store
import { useUserStore } from "../../store/user";

export interface Board {
  boardId: string;
  name: string;
  url: string;
  color: string;
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
 * @param {object} arg0
 * @param {string} arg0.name
 * @param {string} arg0.display
 * @returns {Promise<AxiosResponse<TBoardCreateBody>>} response
 */
export const createBoard = async ({
  name,
  display,
}: TBoardCreateBody): Promise<AxiosResponse<IBoard>> => {
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
 * @param {object} board update board data
 * @param {string} board.name board name
 * @param {string} board.url board url
 * @param {string} board.color board color
 * @param {boolean} board.view_voters view voters in this board
 * @param {boolean} board.display display board on the site
 * @returns {Promise<AxiosResponse<IBoard>>} response
 */
export const updateBoard = async (
  board: TBoardUpdateBody,
): Promise<AxiosResponse<IBoard>> => {
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
 * @param {string} boardId board id
 * @returns {Promise<AxiosResponse<string>>} response
 */
export const deleteBoard = async (
  boardId: string,
): Promise<AxiosResponse<string>> => {
  const { authToken } = useUserStore();

  return await axios({
    method: "DELETE",
    url: `${VITE_API_URL}/api/v1/boards`,
    data: {
      boardId,
    },
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

/**
 * Check board name
 */
export const checkBoardName = async (
  name: string,
): Promise<AxiosResponse<TBoardCheckNameResponse>> => {
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

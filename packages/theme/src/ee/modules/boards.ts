// packages
import axios, { type AxiosResponse } from "axios";
import type {
  IFilterBoardResponseBody,
  IGetBoardsRequestQuery,
  IGetBoardsResponseBody,
  TBoardCheckNameResponse,
  TBoardCreateRequestBody,
  TBoardCreateResponseBody,
  IBoardUpdateRequestBody,
  TFilterBoardRequestQuery,
  TBoardUpdateResponseBody,
  IGetBoardsByUrlResponseBody,
  ISearchBoardResponseBody,
} from "@logchimp/types";

import { VITE_API_URL } from "../../constants";
import { useUserStore } from "../../store/user";

/**
 *	Get public boards
 * @param {string} page page number default to 1
 * @param {string} limit number of items per page
 * @param {ApiSortType} created sort type asc or desc
 * @returns {Promise<AxiosResponse<IFilterBoardResponseBody>>} response
 */
export const getPublicBoards = async ({
  page = "1",
  limit = "10",
  created = "DESC",
}: TFilterBoardRequestQuery): Promise<
  AxiosResponse<IFilterBoardResponseBody>
> => {
  return await axios({
    method: "GET",
    url: `${VITE_API_URL}/api/v1/boards`,
    params: {
      page,
      limit,
      created,
    },
  });
};

/**
 *	Get all boards
 * @param {string} page page number default to 1
 * @param {string} limit number of items per page
 * @param {ApiSortType} created sort type asc or desc
 * @returns {Promise<AxiosResponse<IGetBoardsResponseBody>>} response
 */
export const getAllBoards = async ({
  page = "1",
  limit = "10",
  created = "DESC",
}: IGetBoardsRequestQuery): Promise<AxiosResponse<IGetBoardsResponseBody>> => {
  return await axios({
    method: "GET",
    url: `${VITE_API_URL}/api/v1/boards/get`,
    params: {
      page,
      limit,
      created,
    },
  });
};

/**
 *	Get board by URL
 * @param {string} url board url
 * @returns {Promise<AxiosResponse<IGetBoardsByUrlResponseBody>>} response
 */
export const getBoardByUrl = async (
  url: string,
): Promise<AxiosResponse<IGetBoardsByUrlResponseBody>> => {
  return await axios({
    method: "GET",
    url: `${VITE_API_URL}/api/v1/boards/${url}`,
  });
};

/**
 * Search board by name
 * @param {string} name board name
 * @returns {Promise<AxiosResponse<ISearchBoardResponseBody>>} response
 */
export const searchBoard = async (
  name: string,
): Promise<AxiosResponse<ISearchBoardResponseBody>> => {
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
 * @returns {Promise<AxiosResponse<TBoardCreateRequestBody>>} response
 */
export const createBoard = async ({
  name,
  display,
}: TBoardCreateRequestBody): Promise<
  AxiosResponse<TBoardCreateResponseBody>
> => {
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
 * @param {string} board.boardId board ID
 * @param {string} board.name board name
 * @param {string} board.url board url
 * @param {string} board.color board color
 * @param {boolean} board.view_voters view voters in this board
 * @param {boolean} board.display display board on the site
 * @returns {Promise<AxiosResponse<TBoardUpdateResponseBody>>} response
 */
export const updateBoard = async (
  board: IBoardUpdateRequestBody,
): Promise<AxiosResponse<TBoardUpdateResponseBody>> => {
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
export const checkBoardSlug = async (
  name: string,
): Promise<AxiosResponse<TBoardCheckNameResponse>> => {
  const { authToken } = useUserStore();

  return await axios({
    method: "POST",
    url: `${VITE_API_URL}/api/v1/boards/check-slug`,
    data: {
      name,
    },
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

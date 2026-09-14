// packages
import axios, { type AxiosResponse } from "axios";
import type {
  IBoardUpdateRequestBody,
  IFilterBoardResponseBody,
  IGetBoardsByUrlResponseBody,
  IGetBoardsRequestQuery,
  IGetBoardsResponseBody,
  ISearchBoardResponseBody,
  TBoardCheckSlugResponse,
  TBoardCreateRequestBody,
  TBoardCreateResponseBody,
  TBoardUpdateResponseBody,
  TFilterBoardRequestQuery,
} from "@logchimp/types";

import { VITE_API_URL } from "../../constants";
import { useUserStore } from "../../store/user";
import { APIService } from "../../modules/api.ts";

export class BoardsEE extends APIService {
  constructor(baseURL?: string) {
    super(baseURL || `${VITE_API_URL}/api`);
  }

  /**
   *  Get public boards
   * @param {string} first number of items to fetch
   * @param {string} after cursor to fetch next page
   * @param {ApiSortType} created sort type asc or desc
   * @returns {Promise<AxiosResponse<IFilterBoardResponseBody>>} response
   */
  GetPublicBoards = async ({
    first,
    after,
    created = "DESC",
  }: TFilterBoardRequestQuery): Promise<
    AxiosResponse<IFilterBoardResponseBody>
  > => {
    return this.get("/v1/boards", {
      after,
      first,
      created,
    });
  };

  /**
   *	Get all boards
   * @param {string} page page number default to 1
   * @param {string} limit number of items per page
   * @param {ApiSortType} created sort type asc or desc
   * @returns {Promise<AxiosResponse<IGetBoardsResponseBody>>} response
   */
  GetAllBoards = async ({
    page = "1",
    limit = "10",
    created = "DESC",
  }: IGetBoardsRequestQuery): Promise<
    AxiosResponse<IGetBoardsResponseBody>
  > => {
    return this.get("/v1/boards/get", {
      page,
      limit,
      created,
    });
  };

  /**
   *	Get board by URL
   * @param {string} url board url
   * @returns {Promise<AxiosResponse<IGetBoardsByUrlResponseBody>>} response
   */
  GetBoardByUrl = async (
    url: string,
  ): Promise<AxiosResponse<IGetBoardsByUrlResponseBody>> => {
    return this.get(`/v1/boards/${encodeURIComponent(url)}`);
  };

  /**
   * Search board by name
   * @param {string} name board name
   * @returns {Promise<AxiosResponse<ISearchBoardResponseBody>>} response
   */
  SearchBoard = async (
    name: string,
  ): Promise<AxiosResponse<ISearchBoardResponseBody>> => {
    return this.get(`/v1/boards/search/${encodeURIComponent(name)}`);
  };

  /**
   * Create new board
   * @param {object} board
   * @param {string} board.name
   * @param {string} board.display
   * @returns {Promise<AxiosResponse<TBoardCreateRequestBody>>} response
   */
  CreateBoard = async (
    board?: TBoardCreateRequestBody,
  ): Promise<AxiosResponse<TBoardCreateResponseBody>> => {
    return this.post("/v1/boards", board);
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
  UpdateBoard = async (
    board: IBoardUpdateRequestBody,
  ): Promise<AxiosResponse<TBoardUpdateResponseBody>> => {
    return this.put("/v1/boards", {
      ...board,
    });
  };

  /**
   * delete board
   * @param {string} boardId board id
   * @returns {Promise<AxiosResponse<string>>} response
   */
  DeleteBoard = async (boardId: string): Promise<AxiosResponse<string>> => {
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

  /*
   * Check if board slug exists
   */
  CheckBoardSlug = async (
    url: string,
  ): Promise<AxiosResponse<TBoardCheckSlugResponse>> => {
    return this.post("/v1/boards/check-slug", {
      url,
    });
  };
}

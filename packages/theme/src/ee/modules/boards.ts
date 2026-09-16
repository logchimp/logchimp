// packages
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
import { APIService } from "../../modules/api.ts";
import type { AxiosResponse } from "axios";

export class BoardsEE extends APIService {
  constructor(baseURL?: string) {
    super(baseURL || `${VITE_API_URL}/api`);
  }

  /**
   *  Get public boards
   * @param {string} first number of items to fetch
   * @param {string} after cursor to fetch next page
   * @param {ApiSortType} created sort type asc or desc
   * @returns {Promise<IFilterBoardResponseBody>} response
   */
  GetPublicBoards = async ({
    first,
    after,
    created = "DESC",
  }: TFilterBoardRequestQuery): Promise<IFilterBoardResponseBody> => {
    return this.get("/v1/boards", {
      after,
      first,
      created,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };

  /**
   *	Get all boards
   * @param {string} page page number default to 1
   * @param {string} limit number of items per page
   * @param {ApiSortType} created sort type asc or desc
   * @returns {Promise<IGetBoardsResponseBody>} response
   */
  GetAllBoards = async ({
    page = "1",
    limit = "10",
    created = "DESC",
  }: IGetBoardsRequestQuery): Promise<IGetBoardsResponseBody> => {
    return this.get("/v1/boards/get", {
      page,
      limit,
      created,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };

  /**
   *	Get board by URL
   * @param {string} url board url
   * @returns {Promise<IGetBoardsByUrlResponseBody>} response
   */
  GetBoardByUrl = async (url: string): Promise<IGetBoardsByUrlResponseBody> => {
    return this.get(`/v1/boards/${encodeURIComponent(url)}`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };

  /**
   * Search board by name
   * @param {string} name board name
   * @returns {Promise<ISearchBoardResponseBody>} response
   */
  SearchBoard = async (name: string): Promise<ISearchBoardResponseBody> => {
    return this.get(`/v1/boards/search/${encodeURIComponent(name)}`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };

  /**
   * Create new board
   * @param {object} board
   * @param {string} board.name
   * @param {string} board.display
   * @returns {Promise<TBoardCreateRequestBody>} response
   */
  CreateBoard = async (
    board?: TBoardCreateRequestBody,
  ): Promise<TBoardCreateResponseBody> => {
    return this.post("/v1/boards", board)
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
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
   * @returns {Promise<TBoardUpdateResponseBody>} response
   */
  UpdateBoard = async (
    board: IBoardUpdateRequestBody,
  ): Promise<TBoardUpdateResponseBody> => {
    return this.patch("/v1/boards", {
      ...board,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };

  /**
   * delete board
   * @param {string} boardId board id
   * @returns {Promise<AxiosResponse<string>>} response
   */
  DeleteBoard = async (boardId: string): Promise<AxiosResponse<string>> => {
    return this.delete("/v1/boards", {
      boardId,
    });
  };

  /*
   * Check if board slug exists
   */
  CheckBoardSlug = async (url: string): Promise<TBoardCheckSlugResponse> => {
    return this.post("/v1/boards/check-slug", {
      url,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };
}

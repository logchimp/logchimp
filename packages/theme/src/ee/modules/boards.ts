import type { components, operations } from "@logchimp/api-ts-types";

import { VITE_API_URL } from "../../constants";
import { APIService } from "../../modules/api.ts";
import type { AxiosResponse } from "axios";

export class BoardsEE extends APIService {
  constructor(baseURL?: string) {
    super(baseURL || `${VITE_API_URL}/api`);
  }

  /**
   * Get public boards
   * @param {operations["filterPublicBoards"]["parameters"]["query"]} params
   * @param {string} params.first number of items to fetch
   * @param {string} params.after cursor to fetch next page
   * @param {components["schemas"]["SortTypeEnum"]} params.created sort type asc or desc
   * @returns {Promise<components['schemas']['FilterBoardResponseBody']>} response
   */
  GetPublicBoards = async (
    params: operations["filterPublicBoards"]["parameters"]["query"],
  ): Promise<components["schemas"]["FilterBoardResponseBody"]> => {
    const searchParams = this.buildQueryParams(params);

    return this.get(`/v1/boards?${searchParams.toString()}`, {})
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };

  /**
   *	Get all boards
   * @param {string} page page number default to 1
   * @param {string} limit number of items per page
   * @param {components["schemas"]["SortTypeEnum"]} created sort type asc or desc
   * @returns {Promise<components["schemas"]["GetBoardsResponseBody"]>} response
   */
  GetAllBoards = async ({
    page = "1",
    limit = "10",
    created = "DESC",
  }: operations["listBoards"]["parameters"]["query"] = {}): Promise<
    components["schemas"]["GetBoardsResponseBody"]
  > => {
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
   * @returns {Promise<components["schemas"]["GetBoardByUrlResponseBody"]>} response
   */
  GetBoardByUrl = async (
    url: string,
  ): Promise<components["schemas"]["GetBoardByUrlResponseBody"]> => {
    return this.get(`/v1/boards/${encodeURIComponent(url)}`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };

  /**
   * Search board by name
   * @param {string} name board name
   * @returns {Promise<components["schemas"]["SearchBoardResponseBody"]>} response
   */
  SearchBoard = async (
    name: string,
  ): Promise<components["schemas"]["SearchBoardResponseBody"]> => {
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
   * @returns {Promise<components["schemas"]["CreateBoardResponseBody"]>} response
   */
  CreateBoard = async (
    board?: components["schemas"]["CreateBoardRequestBody"],
  ): Promise<components["schemas"]["CreateBoardResponseBody"]> => {
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
   * @returns {Promise<components["schemas"]["UpdateBoardResponseBody"]>} response
   */
  UpdateBoard = async (
    board: components["schemas"]["UpdateBoardRequestBody"],
  ): Promise<components["schemas"]["UpdateBoardResponseBody"]> => {
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
  CheckBoardSlug = async (
    url: string,
  ): Promise<components["schemas"]["CheckBoardSlugResponseBody"]> => {
    return this.post("/v1/boards/check-slug", {
      url,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };
}

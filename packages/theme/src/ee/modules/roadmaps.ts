import type { AxiosRequestConfig, AxiosResponse } from "axios";
import type {
  ICreateRoadmapRequestBody,
  IDeleteRoadmapRequestBody,
  IGetRoadmapByUrlResponseBody,
  IGetRoadmapsParams,
  IPaginatedRoadmapsResponse,
  ISearchRoadmapResponseBody,
  ISortRoadmapRequestBody,
  IUpdateRoadmapRequestBody,
  TCreateRoadmapResponseBody,
  TDeleteRoadmapResponseBody,
  TSortRoadmapResponseBody,
  TUpdateRoadmapResponseBody,
} from "@logchimp/types";

import { VITE_API_URL } from "../../constants";
import { APIService } from "../../modules/api";

export class RoadmapsEE extends APIService {
  constructor(baseURL?: string) {
    super(baseURL || `${VITE_API_URL}/api`);
  }

  /**
   * Get all roadmaps with cursor-based pagination
   *
   * @param {IGetRoadmapsParams} params - Pagination parameters
   * @param config
   * @returns {Promise<IPaginatedRoadmapsResponse>} response
   */
  GetAllRoadmaps = async (
    params: IGetRoadmapsParams = {},
    config: AxiosRequestConfig = {},
  ): Promise<IPaginatedRoadmapsResponse> => {
    const searchParams = new URLSearchParams();

    for (const paramsKey in params) {
      const value = params[paramsKey as keyof IGetRoadmapsParams];
      if (value) {
        searchParams.append(paramsKey, value.toString());
      }
    }

    return this.get(`/v1/roadmaps?${searchParams.toString()}`, {}, config)
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };

  /**
   * Get board by URL
   * @param {string} url board url
   * @returns {Promise<IGetRoadmapByUrlResponseBody>} response
   */
  GetRoadmapByUrl = async (
    url: string,
  ): Promise<IGetRoadmapByUrlResponseBody> => {
    return this.get(`/v1/roadmaps/${encodeURIComponent(url)}`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };

  /**
   * Search roadmap by name
   * @param {string} name roadmap name
   * @returns {object} response
   */
  SearchRoadmap = async (name: string): Promise<ISearchRoadmapResponseBody> => {
    return this.get(`v1/roadmaps/search/${encodeURIComponent(name)}`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };

  /**
   * Create new roadmap
   * @param {object} roadmap
   * @param {string} [roadmap.name=] roadmap name
   * @returns {Promise<TCreateRoadmapResponseBody>} response
   */
  CreateRoadmap = async (
    roadmap?: ICreateRoadmapRequestBody,
  ): Promise<TCreateRoadmapResponseBody> => {
    return this.post("/v1/roadmaps", roadmap)
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };

  /**
   * Update roadmap
   *
   * @param {object} roadmap update roadmap data
   * @param {string} roadmap.name roadmap name
   * @param {string} roadmap.url roadmap url
   * @param {string} roadmap.color roadmap color
   * @param {boolean} roadmap.display display roadmap on the site
   * @returns {object} response
   */
  UpdateRoadmap = async (
    roadmap: IUpdateRoadmapRequestBody,
  ): Promise<TUpdateRoadmapResponseBody> => {
    return this.put("/v1/roadmaps", {
      ...roadmap,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };

  /**
   * Sort roadmap
   */
  SortRoadmap = async ({
    from,
    to,
  }: ISortRoadmapRequestBody): Promise<
    AxiosResponse<TSortRoadmapResponseBody>
  > => {
    return this.put("/v1/roadmaps/sort", {
      from,
      to,
    });
  };

  /**
   * delete roadmap
   *
   * @param {string} id roadmap id
   *
   * @returns {object} response
   */
  DeleteRoadmap = async ({
    id,
  }: IDeleteRoadmapRequestBody): Promise<
    AxiosResponse<TDeleteRoadmapResponseBody>
  > => {
    return this.delete("/v1/roadmaps", {
      id,
    });
  };
}

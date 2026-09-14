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
   * @returns {Promise<AxiosResponse<IPaginatedRoadmapsResponse>>} response
   */
  GetAllRoadmaps = async (
    params: IGetRoadmapsParams = {},
    config: AxiosRequestConfig = {},
  ): Promise<AxiosResponse<IPaginatedRoadmapsResponse>> => {
    return this.get("/v1/roadmaps", params, config)
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };

  /**
   * Get board by URL
   * @param {string} url board url
   * @returns {Promise<AxiosResponse<IGetRoadmapByUrlResponseBody>>} response
   */
  GetRoadmapByUrl = async (
    url: string,
  ): Promise<AxiosResponse<IGetRoadmapByUrlResponseBody>> => {
    return this.get(`/v1/roadmaps/${encodeURIComponent(url)}`);
  };

  /**
   * Search roadmap by name
   * @param {string} name roadmap name
   * @returns {object} response
   */
  SearchRoadmap = async (
    name: string,
  ): Promise<AxiosResponse<ISearchRoadmapResponseBody>> => {
    return this.get(`v1/roadmaps/search/${encodeURIComponent(name)}`);
  };

  /**
   * Create new roadmap
   * @param {object} roadmap
   * @param {string} [roadmap.name=] roadmap name
   * @returns {Promise<AxiosResponse<TCreateRoadmapResponseBody>>} response
   */
  CreateRoadmap = async (
    roadmap?: ICreateRoadmapRequestBody,
  ): Promise<AxiosResponse<TCreateRoadmapResponseBody>> => {
    return this.post("/v1/roadmaps", roadmap);
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
  ): Promise<AxiosResponse<TUpdateRoadmapResponseBody>> => {
    return this.put("/v1/roadmaps", {
      ...roadmap,
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

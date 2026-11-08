import type { AxiosRequestConfig, AxiosResponse } from "axios";
import type { components, operations } from "@logchimp/api-ts-types";

import { VITE_API_URL } from "../../constants";
import { APIService } from "../../modules/api";

export class RoadmapsEE extends APIService {
  constructor(baseURL?: string) {
    super(baseURL || `${VITE_API_URL}/api`);
  }

  /**
   * Get all roadmaps with cursor-based pagination
   *
   * @param {operations["filterRoadmaps"]["parameters"]["query"]} params - Pagination parameters
   * @param config
   * @returns {Promise<components["schemas"]["GetFilterRoadmapsResponseBody"]>} response
   */
  GetAllRoadmaps = async (
    params: operations["filterRoadmaps"]["parameters"]["query"] = {},
    config: AxiosRequestConfig = {},
  ): Promise<components["schemas"]["GetFilterRoadmapsResponseBody"]> => {
    const searchParams = this.buildQueryParams(params);

    return this.get(`/v1/roadmaps?${searchParams.toString()}`, {}, config)
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };

  /**
   * Get board by URL
   * @param {string} url board url
   * @returns {Promise<components['schemas']['GetRoadmapByUrlResponseBody']>} response
   */
  GetRoadmapByUrl = async (
    url: string,
  ): Promise<components["schemas"]["GetRoadmapByUrlResponseBody"]> => {
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
  SearchRoadmap = async (
    name: string,
  ): Promise<components["schemas"]["SearchRoadmapResponseBody"]> => {
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
   * @returns {Promise<components["schemas"]["CreateRoadmapResponseBody"]>} response
   */
  CreateRoadmap = async (
    roadmap?: components["schemas"]["CreateRoadmapRequestBody"],
  ): Promise<components["schemas"]["CreateRoadmapResponseBody"]> => {
    return this.post("/v1/roadmaps", roadmap)
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };

  /**
   * Update roadmap
   * @param {object} roadmap update roadmap data
   * @param {string} roadmap.name roadmap name
   * @param {string} roadmap.url roadmap url
   * @param {string} roadmap.color roadmap color
   * @param {boolean} roadmap.display display roadmap on the site
   * @returns {Promise<components["schemas"]["UpdateRoadmapResponseBody"]>} response
   */
  UpdateRoadmap = async (
    roadmap: components["schemas"]["UpdateRoadmapRequestBody"],
  ): Promise<components["schemas"]["UpdateRoadmapResponseBody"]> => {
    return this.patch("/v1/roadmaps", {
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
  }: components["schemas"]["SortRoadmapRequestBody"]): Promise<AxiosResponse> => {
    return this.patch("/v1/roadmaps/sort", {
      from,
      to,
    });
  };

  /**
   * delete roadmap
   * @param {string} id roadmap id
   * @returns {object} response
   */
  DeleteRoadmap = async ({
    id,
  }: components["schemas"]["DeleteRoadmapRequestBody"]): Promise<AxiosResponse> => {
    return this.delete("/v1/roadmaps", {
      id,
    });
  };
}

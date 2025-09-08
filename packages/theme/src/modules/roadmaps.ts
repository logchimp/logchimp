import axios, { type AxiosResponse } from "axios";
import type {
  IGetRoadmapByUrlResponseBody,
  IPaginatedRoadmapsResponse,
  ISearchRoadmapResponseBody,
  IGetRoadmapsParams,
} from "@logchimp/types";

import { VITE_API_URL } from "../constants";
import { useUserStore } from "../store/user";

/**
 * Get all roadmaps with cursor-based pagination
 *
 * @param {IGetRoadmapsParams} params - Pagination parameters
 * @returns {Promise<AxiosResponse<IPaginatedRoadmapsResponse>>} response
 */
export const getAllRoadmaps = async (
  params: IGetRoadmapsParams = {},
): Promise<AxiosResponse<IPaginatedRoadmapsResponse>> => {
  const searchParams = new URLSearchParams();

  for (const paramsKey in params) {
    const value = params[paramsKey as keyof IGetRoadmapsParams];
    if (value) {
      searchParams.append(paramsKey, value.toString());
    }
  }

  const url = `${VITE_API_URL}/api/v1/roadmaps${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;

  const { authToken } = useUserStore();

  return await axios({
    method: "GET",
    url,
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

/**
 * Get board by URL
 * @param {string} url board url
 * @returns {Promise<AxiosResponse<IGetRoadmapByUrlResponseBody>>} response
 */
export const getRoadmapByUrl = async (
  url: string,
): Promise<AxiosResponse<IGetRoadmapByUrlResponseBody>> => {
  return await axios({
    method: "GET",
    url: `${VITE_API_URL}/api/v1/roadmaps/${url}`,
  });
};

/**
 * Search roadmap by name
 * @param {string} name roadmap name
 * @returns {object} response
 */
export const searchRoadmap = async (
  name: string,
): Promise<AxiosResponse<ISearchRoadmapResponseBody>> => {
  const { authToken } = useUserStore();

  return await axios({
    method: "GET",
    url: `${VITE_API_URL}/api/v1/roadmaps/search/${name}`,
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

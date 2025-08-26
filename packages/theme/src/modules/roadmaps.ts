import axios, { type AxiosResponse } from "axios";
import type {
  IPaginatedRoadmapsResponse,
  TGetRoadmapsParams,
} from "@logchimp/types";

import { VITE_API_URL } from "../constants";

// store
import { useUserStore } from "../store/user";

/**
 * Get all roadmaps with cursor-based pagination
 *
 * @param {TGetRoadmapsParams} params - Pagination parameters
 * @returns {Promise<AxiosResponse<IPaginatedRoadmapsResponse>>} response
 */
export const getAllRoadmaps = async (
  params: TGetRoadmapsParams = {},
): Promise<AxiosResponse<IPaginatedRoadmapsResponse>> => {
  const searchParams = new URLSearchParams();

  if (params.first !== undefined) {
    searchParams.append("first", params.first.toString());
  }

  if (params.after) {
    searchParams.append("after", params.after);
  }

  const url = `${VITE_API_URL}/api/v1/roadmaps${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;

  return await axios({
    method: "GET",
    url,
  });
};

/**
 * Get board by URL
 *
 * @param {string} url board url
 *
 * @returns {object} response
 */
export const getRoadmapByUrl = async (url: string) => {
  return await axios({
    method: "GET",
    url: `${VITE_API_URL}/api/v1/roadmaps/${url}`,
  });
};

/**
 * Search roadmap by name
 *
 * @param {string} name roadmap name
 *
 * @returns {object} response
 */
export const searchRoadmap = async (name: string) => {
  const { authToken } = useUserStore();

  return await axios({
    method: "GET",
    url: `${VITE_API_URL}/api/v1/roadmaps/search/${name}`,
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

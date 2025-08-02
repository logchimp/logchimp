// packages
import axios, { type AxiosResponse } from "axios";

import { VITE_API_URL } from "../constants";

// store
import { useUserStore } from "../store/user";

// Import types from your centralized types structure
import type {
  Roadmap,
  PaginatedRoadmapsResponse,
  GetRoadmapsParams
} from "../type/src";

// Remove these local interface definitions since they're now imported:
// export interface Roadmap { ... } // ← DELETE THIS
// export interface GetRoadmapsParams { ... } // ← DELETE THIS
// export interface PaginatedRoadmapsResponse { ... } // ← DELETE THIS

/**
 * Get all roadmaps with cursor-based pagination
 *
 * @param {GetRoadmapsParams} params - Pagination parameters
 * @returns {Promise<AxiosResponse<PaginatedRoadmapsResponse>>} response
 */
export const getAllRoadmaps = async (
  params: GetRoadmapsParams = {}
): Promise<AxiosResponse<PaginatedRoadmapsResponse>> => {
  // Build query parameters
  const searchParams = new URLSearchParams();

  if (params.first !== undefined) {
    searchParams.append('first', params.first.toString());
  }

  if (params.after) {
    searchParams.append('after', params.after);
  }

  const url = `${VITE_API_URL}/api/v1/roadmaps${
    searchParams.toString() ? '?' + searchParams.toString() : ''
  }`;

  return await axios({
    method: "GET",
    url,
  });
  // Note: Remove "return response.data;" since we're now returning the full AxiosResponse
};

/**
 * Get board by URL
 *
 * @param {string} url board url
 * @returns {Promise<AxiosResponse<any>>} response
 */
export const getRoadmapByUrl = async (url: string): Promise<AxiosResponse<any>> => {
  return await axios({
    method: "GET",
    url: `${VITE_API_URL}/api/v1/roadmaps/${url}`,
  });
};

/**
 * Search roadmap by name
 *
 * @param {string} name roadmap name
 * @returns {Promise<AxiosResponse<any>>} response
 */
export const searchRoadmap = async (name: string): Promise<AxiosResponse<any>> => {
  const { authToken } = useUserStore();

  return await axios({
    method: "GET",
    url: `${VITE_API_URL}/api/v1/roadmaps/search/${name}`,
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

// packages
import axios from "axios";

import { VITE_API_URL } from "../constants";

// store
import { useUserStore } from "../store/user";

export interface Roadmap {
  id: string;
  name: string;
  url: string;
  color: string;
  display: string;
  index: number;
}

// New interface for pagination parameters
export interface GetRoadmapsParams {
  first?: number;
  after?: string;
}

// New interface for the paginated response
export interface PaginatedRoadmapsResponse {
  data: Roadmap[];
  page_info: {
    count: number;
    current_page: number;
    has_next_page: boolean;
  };
  total_pages?: number | null;
  total_count?: number | null;
}

/**
 * Get all roadmaps with cursor-based pagination
 *
 * @param {GetRoadmapsParams} params - Pagination parameters
 * @returns {Promise<PaginatedRoadmapsResponse>} response
 */
export const getAllRoadmaps = async (params: GetRoadmapsParams = {}): Promise<PaginatedRoadmapsResponse> => {
  // Build query parameters
  const searchParams = new URLSearchParams();

  if (params.first !== undefined) {
    searchParams.append('first', params.first.toString());
  }

  if (params.after) {
    searchParams.append('after', params.after);
  }

  const url = `${VITE_API_URL}/api/v1/roadmaps${searchParams.toString() ? '?' + searchParams.toString() : ''}`;

  const response = await axios({
    method: "GET",
    url,
  });

  return response.data;
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

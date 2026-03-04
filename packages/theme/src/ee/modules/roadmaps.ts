import axios, { type AxiosResponse } from "axios";
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
import { useUserStore } from "../../store/user";

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
  const { authToken } = useUserStore();

  return await axios({
    method: "GET",
    url: `${VITE_API_URL}/api/v1/roadmaps/${encodeURIComponent(url)}`,
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
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
    url: `${VITE_API_URL}/api/v1/roadmaps/search/${encodeURIComponent(name)}`,
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

/**
 * Create new roadmap
 * @param {object} roadmap
 * @param {string} [roadmap.name=] roadmap name
 * @returns {Promise<AxiosResponse<TCreateRoadmapResponseBody>>} response
 */
export const createRoadmap = async (
  roadmap?: ICreateRoadmapRequestBody,
): Promise<AxiosResponse<TCreateRoadmapResponseBody>> => {
  const { authToken } = useUserStore();

  return await axios({
    method: "POST",
    url: `${VITE_API_URL}/api/v1/roadmaps`,
    data: {
      name: roadmap?.name,
    },
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
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
export const updateRoadmap = async (
  roadmap: IUpdateRoadmapRequestBody,
): Promise<AxiosResponse<TUpdateRoadmapResponseBody>> => {
  const { authToken } = useUserStore();

  return await axios({
    method: "PATCH",
    url: `${VITE_API_URL}/api/v1/roadmaps`,
    data: {
      ...roadmap,
    },
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

/**
 * Sort roadmap
 */
export const sortRoadmap = async ({
  from,
  to,
}: ISortRoadmapRequestBody): Promise<
  AxiosResponse<TSortRoadmapResponseBody>
> => {
  const { authToken } = useUserStore();

  return await axios({
    method: "PATCH",
    url: `${VITE_API_URL}/api/v1/roadmaps/sort`,
    data: {
      from,
      to,
    },
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

/**
 * delete roadmap
 *
 * @param {string} id roadmap id
 *
 * @returns {object} response
 */
export const deleteRoadmap = async ({
  id,
}: IDeleteRoadmapRequestBody): Promise<
  AxiosResponse<TDeleteRoadmapResponseBody>
> => {
  const { authToken } = useUserStore();

  return await axios({
    method: "DELETE",
    url: `${VITE_API_URL}/api/v1/roadmaps`,
    data: {
      id,
    },
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

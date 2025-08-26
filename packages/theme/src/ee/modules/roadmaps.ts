import axios from "axios";
import type {
  DraggableSortFromToType,
  IUpdateRoadmapRequestBody,
} from "@logchimp/types";

import { VITE_API_URL } from "../../constants";

// store
import { useUserStore } from "../../store/user";

/**
 * Create new roadmap
 *
 * @returns {object} response
 */
export const createRoadmap = async () => {
  const { authToken } = useUserStore();

  return await axios({
    method: "POST",
    url: `${VITE_API_URL}/api/v1/roadmaps`,
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
export const updateRoadmap = async (roadmap: IUpdateRoadmapRequestBody) => {
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
export const sortRoadmap = async ({ from, to }: DraggableSortFromToType) => {
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
export const deleteRoadmap = async (id: string) => {
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

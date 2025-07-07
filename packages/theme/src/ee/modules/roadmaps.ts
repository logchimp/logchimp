// packges
import axios from "axios";

// store
import { useUserStore } from "../../store/user";
import type { DraggableSortFromToType } from "../../types";
import type { Roadmap } from "../../modules/roadmaps";

interface UpdateRoadmapArgs extends Roadmap {
  display: boolean;
}

/**
 * Create new roadmap
 *
 * @returns {object} response
 */
export const createRoadmap = async () => {
  const { authToken } = useUserStore();

  return await axios({
    method: "POST",
    url: "/api/v1/roadmaps",
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
 *
 * @returns {object} response
 */
export const updateRoadmap = async (roadmap: UpdateRoadmapArgs) => {
  const { authToken } = useUserStore();

  return await axios({
    method: "PATCH",
    url: "/api/v1/roadmaps",
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
 *
 * @param {object} roadmap two roadmap objects which will swap places
 * @param {object} roadmap.from from roadmap object
 * @param {string} roadmap.from.id from roadmap UUID
 * @param {number} roadmap.from.index from roadmap index
 * @param {object} roadmap.to to roadmap object
 * @param {string} roadmap.to.id to roadmap UUID
 * @param {number} roadmap.to.index to roadmap index
 *
 * @returns {object} response
 */
export const sortRoadmap = async ({ from, to }: DraggableSortFromToType) => {
  const { authToken } = useUserStore();

  return await axios({
    method: "PATCH",
    url: "/api/v1/roadmaps/sort",
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
    url: "/api/v1/roadmaps",
    data: {
      id,
    },
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

// packges
import axios from "axios";

// store
import store from "../store";

/**
 *	Get all roadmaps
 *
 * @returns {object} response
 */
export const getAllRoadmaps = async () => {
  return await axios({
    method: "GET",
    url: "/api/v1/roadmaps"
  });
};

/**
 *	Get board by URL
 *
 * @param {string} url board url
 *
 * @returns {object} response
 */
export const getRoadmapByUrl = async url => {
  return await axios({
    method: "GET",
    url: `/api/v1/roadmaps/${url}`
  });
};

/**
 * Search roadmap by name
 *
 * @param {string} name roadmap name
 *
 * @returns {object} response
 */
export const searchRoadmap = async name => {
  const token = store.getters["user/getAuthToken"];

  return await axios({
    method: "GET",
    url: `/api/v1/roadmaps/search/${name}`,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

/**
 * Create new roadmap
 *
 * @returns {object} response
 */
export const createRoadmap = async () => {
  const token = store.getters["user/getAuthToken"];

  return await axios({
    method: "POST",
    url: "/api/v1/roadmaps",
    headers: {
      Authorization: `Bearer ${token}`
    }
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
export const updateRoadmap = async roadmap => {
  const token = store.getters["user/getAuthToken"];

  return await axios({
    method: "PATCH",
    url: "/api/v1/roadmaps",
    data: {
      ...roadmap
    },
    headers: {
      Authorization: `Bearer ${token}`
    }
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
export const sortRoadmap = async ({ from, to }) => {
  const token = store.getters["user/getAuthToken"];

  return await axios({
    method: "PATCH",
    url: "/api/v1/roadmaps/sort",
    data: {
      from,
      to
    },
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

/**
 * delete roadmap
 *
 * @param {string} id roadmap id
 *
 * @returns {object} response
 */
export const deleteRoadmap = async id => {
  const token = store.getters["user/getAuthToken"];

  return await axios({
    method: "DELETE",
    url: "/api/v1/roadmaps",
    data: {
      id
    },
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

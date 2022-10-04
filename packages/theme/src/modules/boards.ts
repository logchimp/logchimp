// packges
import axios from "axios";

// store
import store from "../store";

/**
 *	Get public boards
 *
 * @param {number} page page number default to 1
 * @param {string} sort sort type asc or desc
 *
 * @returns {object} response
 */
export const getPublicBoards = async (page = 1, limit, sort = "desc") => {
  return await axios({
    method: "GET",
    url: "/api/v1/boards",
    params: {
      page,
      limit,
      created: sort
    }
  });
};

/**
 *	Get all boards
 *
 * @param {number} page page number default to 1
 * @param {string} sort sort type asc or desc
 *
 * @returns {object} response
 */
export const getAllBoards = async (page = 1, limit, sort = "desc") => {
  return await axios({
    method: "GET",
    url: "/api/v1/boards/get",
    params: {
      page,
      limit,
      created: sort
    }
  });
};

/**
 *	Get board by URL
 *
 * @param {string} url board url
 *
 * @returns {object} response
 */
export const getBoardByUrl = async url => {
  return await axios({
    method: "GET",
    url: `/api/v1/boards/${url}`
  });
};

/**
 * Search board by name
 *
 * @param {string} name board name
 *
 * @returns {object} response
 */
export const searchBoard = async name => {
  const token = store.getters["user/getAuthToken"];

  return await axios({
    method: "GET",
    url: `/api/v1/boards/search/${name}`,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

/**
 * Create new board
 *
 * @returns {object} response
 */
export const createBoard = async () => {
  const token = store.getters["user/getAuthToken"];

  return await axios({
    method: "POST",
    url: "/api/v1/boards",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

/**
 * Update board
 *
 * @param {object} board update board data
 * @param {string} board.name board name
 * @param {string} board.url board url
 * @param {string} board.color board color
 * @param {boolean} board.view_voters view voters in this board
 * @param {boolean} board.display display board on the site
 *
 * @returns {object} response
 */
export const updateBoard = async board => {
  const token = store.getters["user/getAuthToken"];
  return await axios({
    method: "PATCH",
    url: "/api/v1/boards",
    data: {
      ...board
    },
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

/**
 * delete board
 *
 * @param {string} id board id
 *
 * @returns {object} response
 */
export const deleteBoard = async id => {
  const token = store.getters["user/getAuthToken"];

  return await axios({
    method: "DELETE",
    url: "/api/v1/boards",
    data: {
      id
    },
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

/**
 * Check board name
 *
 * @param {string} name board name
 *
 * @returns {object} response
 */
export const checkBoardName = async name => {
  const token = store.getters["user/getAuthToken"];

  return await axios({
    method: "POST",
    url: "/api/v1/boards/check-name",
    data: {
      name
    },
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

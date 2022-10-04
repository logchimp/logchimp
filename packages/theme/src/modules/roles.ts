// packges
import axios from "axios";

// store
import store from "../store";

/**
 *	Get all roles
 *
 * @returns {object} response
 */
export const getAllRoles = async () => {
  const token = store.getters["user/getAuthToken"];

  return await axios({
    method: "GET",
    url: "/api/v1/roles",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

/**
 *	Get role by UUID
 *
 * @param {string} id role id
 *
 * @returns {object} response
 */
export const getRole = async id => {
  const token = store.getters["user/getAuthToken"];

  return await axios({
    method: "GET",
    url: `/api/v1/roles/${id}`,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

/**
 *	Create role
 *
 * @returns {object} response
 */
export const createRole = async () => {
  const token = store.getters["user/getAuthToken"];

  return await axios({
    method: "POST",
    url: "/api/v1/roles",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

/**
 * Updatae a role
 *
 * @param {object} role update role
 * @param {string} role.id role id
 * @param {string} role.name role name
 * @param {string} role.description role description
 * @param {string[]} role.permissions list of permission
 *
 * @returns {object} response
 */
export const updateRole = async role => {
  const token = store.getters["user/getAuthToken"];

  return await axios({
    method: "PATCH",
    url: "/api/v1/roles",
    data: {
      ...role
    },
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

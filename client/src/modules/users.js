// packges
import axios from "axios";

// store
import store from "../store";

/**
 * Get user settings
 *
 * @param {string} userId user UUID
 *
 * @returns {object} response
 */
export const getUserSettings = async () => {
  const token = store.getters["user/getAuthToken"];

  return await axios({
    method: "GET",
    url: "/api/v1/users/profile",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

/**
 *	Update user settings
 *
 * @param {object} user update user data
 * @param {string} user.name user's name
 *
 * @returns {object} response
 */
export const updateUserSettings = async user => {
  const token = store.getters["user/getAuthToken"];

  return await axios({
    method: "patch",
    url: "/api/v1/users/profile",
    data: {
      ...user
    },
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

/**
 * Get authenticated user permissions
 */
export const getPermissions = async () => {
  const token = store.getters["user/getAuthToken"];

  return await axios({
    method: "GET",
    url: "/api/v1/users/permissions",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

/**
 *	Get all users
 *
 * @param {number} page page number default to 1
 * @param {string} sort sort type asc or desc
 *
 * @returns {object} response
 */
export const getAllUsers = async (page, sort) => {
  return await axios({
    method: "GET",
    url: "/api/v1/users",
    params: {
      page,
      created: sort
    }
  });
};

/**
 *	Check if user have access to dashboard
 *
 * @returns {object} response
 */
export const checkUserDashboardAccess = async () => {
  const token = store.getters["user/getAuthToken"];

  return await axios({
    method: "GET",
    url: "/api/v1/users/dashboard",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

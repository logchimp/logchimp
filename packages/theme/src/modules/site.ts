// packges
import axios from "axios";

// store
import store from "../store";

/**
 * Create owner account while setting up LogChimp site.
 *
 * @param {string} siteTitle site title
 * @param {string} name user name
 * @param {string} email user email address
 * @param {string} password user password
 *
 * @returns {object} response
 */
export const siteSetup = async (siteTitle, name, email, password) => {
  return await axios({
    method: "POST",
    url: "/api/v1/auth/setup",
    data: {
      siteTitle,
      name,
      email,
      password
    }
  });
};

/**
 * Get site settings
 *
 * @returns {object} response
 */
export const isSiteSetup = async () => {
  return await axios({
    method: "GET",
    url: "/api/v1/auth/setup"
  });
};

/**
 * Get site settings
 *
 * @returns {object} response
 */
export const getSettings = async () => {
  return await axios({
    method: "GET",
    url: "/api/v1/settings/site"
  });
};

/**
 * Update site settings
 *
 * @param {object} site update site setting data
 * @param {string} site.title site title
 * @param {string} site.description site description
 * @param {string} site.accentColor site accent color
 * @param {string} site.googleAnalyticsId site google analytics ID
 * @param {string} site.allowSignup allow user creating account
 *
 * @returns {object} response
 */
export const updateSettings = async site => {
  const token = store.getters["user/getAuthToken"];

  return await axios({
    method: "PATCH",
    url: "/api/v1/settings/site",
    data: {
      ...site
    },
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

/**
 * upload site logo
 *
 * @param {FormData} logo logo (image file)
 *
 * @returns {object} response
 */
export const uploadSiteLogo = async logo => {
  const token = store.getters["user/getAuthToken"];

  return await axios({
    method: "POST",
    url: "/api/v1/settings/update-logo",
    data: logo,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data"
    }
  });
};

/**
 * Get labs settings
 *
 * @returns {object} response
 */
export const getLabsSettings = async () => {
  return await axios({
    method: "GET",
    url: "/api/v1/settings/labs"
  });
};

/**
 * update labs settings
 *
 * @param {*} labs
 *
 * @returns {object} response
 */
export const updateLabsSettings = async labs => {
  const token = store.getters["user/getAuthToken"];

  return await axios({
    method: "PATCH",
    url: "/api/v1/settings/labs",
    data: labs,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

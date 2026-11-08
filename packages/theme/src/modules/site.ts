import axios, { type AxiosResponse } from "axios";
import type { components } from "@logchimp/api-ts-types";

import { useUserStore } from "../store/user";
import { VITE_API_URL } from "../constants";

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
export const siteSetup = async ({
  siteTitle,
  name,
  email,
  password,
}: components["schemas"]["CreateSiteSetupRequestBody"]): Promise<
  AxiosResponse<components["schemas"]["CreateSiteSetupResponseBody"]>
> => {
  return await axios({
    method: "POST",
    url: `${VITE_API_URL}/api/v1/auth/setup`,
    data: {
      siteTitle,
      name,
      email,
      password,
    },
  });
};

/**
 * Get site settings
 * @returns {Promise<AxiosResponse<components['schemas']['GetSiteSetupResponseBody']>>} response
 */
export const isSiteSetup = async (): Promise<
  AxiosResponse<components["schemas"]["GetSiteSetupResponseBody"]>
> => {
  return await axios({
    method: "GET",
    url: `${VITE_API_URL}/api/v1/auth/setup`,
  });
};

/**
 * Get site settings
 * @returns {Promise<AxiosResponse<components["schemas"]["GetSiteSettingsResponseBody"]>>} response
 */
export const getSettings = async (): Promise<
  AxiosResponse<components["schemas"]["GetSiteSettingsResponseBody"]>
> => {
  return await axios({
    method: "GET",
    url: `${VITE_API_URL}/api/v1/settings/site`,
  });
};

/**
 * Update site settings
 *
 * @param {components["schemas"]["UpdateSiteSettingsRequestBody"]} site update site setting data
 * @param {string} site.title site title
 * @param {string} site.description site description
 * @param {string} site.logo site logo URL
 * @param {string} site.accentColor site accent color
 * @param {string} site.googleAnalyticsId site google analytics ID
 * @param {boolean} site.allowSignup allow user creating account
 * @param {boolean} site.developer_mode toggle developer mode
 * @returns {Promise<AxiosResponse<components["schemas"]["UpdateSiteSettingsResponseBody"]>>} response
 */
export const updateSettings = async (
  site: components["schemas"]["UpdateSiteSettingsRequestBody"],
): Promise<
  AxiosResponse<components["schemas"]["UpdateSiteSettingsResponseBody"]>
> => {
  const { authToken } = useUserStore();

  return await axios({
    method: "PATCH",
    url: `${VITE_API_URL}/api/v1/settings/site`,
    data: {
      ...site,
    },
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

// Upload site logo
export const uploadSiteLogo = async (logo: FormData) => {
  const { authToken } = useUserStore();

  return await axios({
    method: "POST",
    url: `${VITE_API_URL}/api/v1/settings/update-logo`,
    data: logo,
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

/**
 * Get labs settings
 * @returns {Promise<AxiosResponse<components["schemas"]["GetSiteSettingsLabsResponseBody"]>>} response
 */
export const getLabsSettings = async (): Promise<
  AxiosResponse<components["schemas"]["GetSiteSettingsLabsResponseBody"]>
> => {
  return await axios({
    method: "GET",
    url: `${VITE_API_URL}/api/v1/settings/labs`,
  });
};

/**
 * update labs settings
 * @param {components["schemas"]["UpdateSiteSettingsLabsRequestBody"]} labs
 * @returns {Promise<AxiosResponse<components["schemas"]["UpdateSiteSettingsLabsResponseBody"]>>} response
 */
export const updateLabsSettings = async (
  labs: components["schemas"]["UpdateSiteSettingsLabsRequestBody"],
): Promise<
  AxiosResponse<components["schemas"]["UpdateSiteSettingsLabsResponseBody"]>
> => {
  const { authToken } = useUserStore();

  return await axios({
    method: "PATCH",
    url: `${VITE_API_URL}/api/v1/settings/labs`,
    data: labs,
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

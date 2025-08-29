import axios, { type AxiosResponse } from "axios";
import type {
  ICreateSiteSetupRequestBody,
  IGetSiteSettingsResponseBody,
  IGetSiteSetupResponseBody,
  IUpdateSiteSettingsRequestBody,
  TCreateSiteSetupResponseBody,
  TGetSiteSettingsLabResponseBody,
  TUpdateSiteSettingsLabRequestBody,
  TUpdateSiteSettingsLabResponseBody,
  TUpdateSiteSettingsResponseBody,
} from "@logchimp/types";

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
}: ICreateSiteSetupRequestBody): Promise<
  AxiosResponse<TCreateSiteSetupResponseBody>
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
 * @returns {Promise<AxiosResponse<IGetSiteSetupResponseBody>>} response
 */
export const isSiteSetup = async (): Promise<
  AxiosResponse<IGetSiteSetupResponseBody>
> => {
  return await axios({
    method: "GET",
    url: `${VITE_API_URL}/api/v1/auth/setup`,
  });
};

/**
 * Get site settings
 * @returns {Promise<AxiosResponse<IGetSiteSetupResponseBody>>} response
 */
export const getSettings = async (): Promise<
  AxiosResponse<IGetSiteSettingsResponseBody>
> => {
  return await axios({
    method: "GET",
    url: `${VITE_API_URL}/api/v1/settings/site`,
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
 * @param {boolean} site.allowSignup allow user creating account
 * @param {boolean} site.developer_mode toggle developer mode
 * @returns {Promise<AxiosResponse<TUpdateSiteSettingsResponseBody>>} response
 */
export const updateSettings = async (
  site: IUpdateSiteSettingsRequestBody,
): Promise<AxiosResponse<TUpdateSiteSettingsResponseBody>> => {
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
 * @returns {Promise<AxiosResponse<TGetSiteSettingsLabResponseBody>>} response
 */
export const getLabsSettings = async (): Promise<
  AxiosResponse<TGetSiteSettingsLabResponseBody>
> => {
  return await axios({
    method: "GET",
    url: `${VITE_API_URL}/api/v1/settings/labs`,
  });
};

/**
 * update labs settings
 * @param {TUpdateSiteSettingsLabRequestBody} labs
 * @returns {Promise<AxiosResponse<TUpdateSiteSettingsLabResponseBody>>} response
 */
export const updateLabsSettings = async (
  labs: TUpdateSiteSettingsLabRequestBody,
): Promise<AxiosResponse<TUpdateSiteSettingsLabResponseBody>> => {
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

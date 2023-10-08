// packges
import axios from "axios";

// store
import { useUserStore } from "../store/user";

interface SiteSetupArgs {
  siteTitle: string;
  name: string;
  email: string;
  password: string;
}

export interface LabsType {
  comments: boolean;
}

interface SiteSettingsType {
  title: string;
  description?: string;
  logo?: string;
  accentColor: string;
  googleAnalyticsId: string;
  isPoweredBy?: boolean;
  allowSignup: boolean;
  developer_mode: boolean;
  labs?: LabsType;
}

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
}: SiteSetupArgs) => {
  return await axios({
    method: "POST",
    url: "/api/v1/auth/setup",
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
 *
 * @returns {object} response
 */
export const isSiteSetup = async () => {
  return await axios({
    method: "GET",
    url: "/api/v1/auth/setup",
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
    url: "/api/v1/settings/site",
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
export const updateSettings = async (site: SiteSettingsType) => {
  const { authToken } = useUserStore();

  return await axios({
    method: "PATCH",
    url: "/api/v1/settings/site",
    data: {
      ...site,
    },
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

/**
 * upload site logo
 *
 * @param {FormData} logo logo (image file)
 *
 * @returns {object} response
 */
// TODO: Add TS types
// biome-ignore lint: Add TS types
export const uploadSiteLogo = async (logo: any) => {
  const { authToken } = useUserStore();

  return await axios({
    method: "POST",
    url: "/api/v1/settings/update-logo",
    data: logo,
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "multipart/form-data",
    },
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
    url: "/api/v1/settings/labs",
  });
};

/**
 * update labs settings
 *
 * @param {*} labs
 *
 * @returns {object} response
 */
export const updateLabsSettings = async (labs: LabsType) => {
  const { authToken } = useUserStore();

  return await axios({
    method: "PATCH",
    url: "/api/v1/settings/labs",
    data: labs,
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

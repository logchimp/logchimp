// packages
import axios, { type AxiosResponse } from "axios";
import type {
  ApiPaginationType,
  IAuthUserProfile,
  IAuthUserProfileResponse,
  IUpdateUserSettingsArgs,
} from "@logchimp/types";

// store
import { useUserStore } from "../store/user";

import { VITE_API_URL } from "../constants";

export interface UserType {
  userId: string;
  name: string;
  username: string;
  avatar: string;
}

export type PermissionType = string[];

interface GetPermissions {
  permissions: PermissionType;
}

/**
 * Get user settings
 * @returns {Promise<AxiosResponse<IAuthUserProfileResponse<IAuthUserProfile>>>} response
 */
export const getUserSettings = async (): Promise<
  AxiosResponse<IAuthUserProfileResponse<IAuthUserProfile>>
> => {
  const { authToken } = useUserStore();

  return await axios({
    method: "GET",
    url: `${VITE_API_URL}/api/v1/users/profile`,
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

/**
 *	Update user settings
 * @param {object} user update user data
 * @param {string} user.name user's name
 * @returns {Promise<AxiosResponse<IAuthUserProfileResponse<IAuthUserProfile>>>} response
 */
export const updateUserSettings = async ({
  name,
}: IUpdateUserSettingsArgs): Promise<
  AxiosResponse<IAuthUserProfileResponse<IAuthUserProfile>>
> => {
  const { authToken } = useUserStore();

  return await axios({
    method: "patch",
    url: `${VITE_API_URL}/api/v1/users/profile`,
    data: {
      name,
    },
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

/**
 * Get authenticated user permissions
 */
export const getPermissions = async (): Promise<
  AxiosResponse<GetPermissions>
> => {
  const { authToken } = useUserStore();

  return await axios({
    method: "GET",
    url: `${VITE_API_URL}/api/v1/users/permissions`,
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
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
export const getAllUsers = async ({ page, sort }: ApiPaginationType) => {
  return await axios({
    method: "GET",
    url: `${VITE_API_URL}/api/v1/users`,
    params: {
      page,
      created: sort,
    },
  });
};

/**
 *	Check if user have access to dashboard
 *
 * @returns {object} response
 */
export const checkUserDashboardAccess = async () => {
  const { authToken } = useUserStore();

  return await axios({
    method: "GET",
    url: `${VITE_API_URL}/api/v1/users/dashboard`,
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

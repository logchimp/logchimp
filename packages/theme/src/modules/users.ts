// packages
import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import type {
  IAuthUserProfile,
  IAuthUserProfileResponse,
  IUpdateUserSettingsArgs,
  IGetPermissionResponse,
  IGetUsersResponseBody,
  IGetUsersRequestQuery,
} from "@logchimp/types";

// store
import { useUserStore } from "../store/user";

import { APIService } from "./api";
import { VITE_API_URL } from "../constants";

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
  AxiosResponse<IGetPermissionResponse>
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

export class Users extends APIService {
  constructor(baseURL?: string) {
    super(baseURL || `${VITE_API_URL}/api`);
  }

  /**
   * @param {Partial<IGetUsersRequestQuery>} [params={}] - URL parameters
   * @returns {Promise<AxiosResponse<IGetUsersResponseBody>>}
   */
  async getAll(
    params: Partial<IGetUsersRequestQuery> = {},
  ): Promise<IGetUsersResponseBody> {
    const { authToken } = useUserStore();
    const config: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    };

    return this.get("/v1/users", params, config)
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  }
}

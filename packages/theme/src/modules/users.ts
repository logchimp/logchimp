// packages
import axios, { type AxiosResponse } from "axios";
import type {
  IAuthUserProfile,
  IAuthUserProfileResponse,
  IGetPermissionResponse,
  IGetUsersRequestQuery,
  IGetUsersResponseBody,
  IUpdateUserSettingsArgs,
} from "@logchimp/types";

// store
import { useUserStore } from "../store/user";

import { APIService } from "./api";
import { VITE_API_URL } from "../constants";

export class UsersAPI extends APIService {
  constructor(baseURL?: string) {
    super(baseURL || `${VITE_API_URL}/api`);
  }

  /**
   * Get user settings
   * @returns {Promise<AxiosResponse<IAuthUserProfileResponse<IAuthUserProfile>>>} response
   */
  GetUserSettings = async (): Promise<
    AxiosResponse<IAuthUserProfileResponse<IAuthUserProfile>>
  > => {
    return this.get("/v1/users/profile");
  };

  /**
   *	Update user settings
   * @param {object} user update user data
   * @param {string} user.name user's name
   * @returns {Promise<AxiosResponse<IAuthUserProfileResponse<IAuthUserProfile>>>} response
   */
  UpdateUserSettings = async ({
    name,
  }: IUpdateUserSettingsArgs): Promise<
    AxiosResponse<IAuthUserProfileResponse<IAuthUserProfile>>
  > => {
    return this.put("/v1/users/profile", {
      name,
    });
  };

  /**
   * Get authenticated user permissions
   */
  GetPermissions = async (): Promise<AxiosResponse<IGetPermissionResponse>> => {
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
  CheckUserDashboardAccess = async () => {
    const { authToken } = useUserStore();

    return await axios({
      method: "GET",
      url: `${VITE_API_URL}/api/v1/users/dashboard`,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
  };

  /**
   * @param {Partial<IGetUsersRequestQuery>} [params={}] - URL parameters
   * @returns {Promise<AxiosResponse<IGetUsersResponseBody>>}
   */
  async GetAll(
    params: Partial<IGetUsersRequestQuery> = {},
  ): Promise<IGetUsersResponseBody> {
    return this.get("/v1/users", params)
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  }
}

import type {
  IAuthUserProfile,
  IAuthUserProfileResponse,
  ICheckUserDashboardAccess,
  IGetPermissionResponse,
  IGetUsersRequestQuery,
  IGetUsersResponseBody,
  IUpdateUserSettingsArgs,
} from "@logchimp/types";

// store
import { APIService } from "./api";
import { VITE_API_URL } from "../constants";

export class UsersAPI extends APIService {
  constructor(baseURL?: string) {
    super(baseURL || `${VITE_API_URL}/api`);
  }

  /**
   * Get user settings
   * @returns {Promise<IAuthUserProfileResponse<IAuthUserProfile>>} response
   */
  GetUserSettings = async (): Promise<
    IAuthUserProfileResponse<IAuthUserProfile>
  > => {
    return this.get("/v1/users/profile")
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };

  /**
   *	Update user settings
   * @param {object} user update user data
   * @param {string} user.name user's name
   * @returns {Promise<IAuthUserProfileResponse<IAuthUserProfile>>} response
   */
  UpdateUserSettings = async ({
    name,
  }: IUpdateUserSettingsArgs): Promise<
    IAuthUserProfileResponse<IAuthUserProfile>
  > => {
    return this.put("/v1/users/profile", {
      name,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };

  /**
   * Get authenticated user permissions
   */
  GetPermissions = async (): Promise<IGetPermissionResponse> => {
    return this.get("/v1/users/permissions")
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };

  /**
   * Check if user have access to dashboard
   * @returns {Promise<ICheckUserDashboardAccess>}
   */
  CheckUserDashboardAccess = async (): Promise<ICheckUserDashboardAccess> => {
    return this.get("/v1/users/dashboard")
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };

  /**
   * @param {Partial<IGetUsersRequestQuery>} [params={}] - URL parameters
   * @returns {Promise<IGetUsersResponseBody>}
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

import type { components } from "@logchimp/api-ts-types";

// store
import { APIService } from "./api";
import { VITE_API_URL } from "../constants";

export class MeAPI extends APIService {
  constructor(baseURL?: string) {
    super(baseURL || `${VITE_API_URL}/api`);
  }

  /**
   * Get user settings
   * @returns {Promise<components["schemas"]["GetUserProfileResponseBody"]>} response
   */
  GetUserSettings = async (): Promise<
    components["schemas"]["GetUserProfileResponseBody"]
  > => {
    return this.get("/v1/me/profile")
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };

  /**
   *	Update user settings
   * @param {object} user update user data
   * @param {string} user.name user's name
   * @returns {Promise<components["schemas"]["UpdateUserProfileResponseBody"]>} response
   */
  UpdateUserSettings = async ({
    name,
  }: components["schemas"]["UpdateUserProfileRequestBody"]): Promise<
    components["schemas"]["UpdateUserProfileResponseBody"]
  > => {
    return this.patch("/v1/me/profile", {
      name,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };

  /**
   * Get authenticated user permissions
   * @returns {Promise<components["schemas"]["MePermissionsResponseBody"]>}
   */
  GetPermissions = async (): Promise<
    components["schemas"]["MePermissionsResponseBody"]
  > => {
    return this.get("/v1/me/permissions")
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };

  /**
   * Check if user have access to dashboard
   * @returns {Promise<components["schemas"]["CheckUserDashboardAccessResponseBody"]>}
   */
  CheckUserDashboardAccess = async (): Promise<
    components["schemas"]["CheckUserDashboardAccessResponseBody"]
  > => {
    return this.get("/v1/me/dashboard")
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };
}

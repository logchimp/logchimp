import type { TUserAssignRoleResponse } from "@logchimp/types";

import { VITE_API_URL } from "../../constants";

// store
import { APIService } from "../../modules/api";

export class UsersEe extends APIService {
  constructor(baseURL?: string) {
    super(baseURL || `${VITE_API_URL}/api`);
  }

  /**
   * Assign role to user
   * @param {string} roleId
   * @param {string} userId
   */
  async assignRole(
    roleId: string,
    userId: string,
  ): Promise<TUserAssignRoleResponse> {
    return this.put(`/v1/roles/${roleId}/users/${userId}`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  }
}

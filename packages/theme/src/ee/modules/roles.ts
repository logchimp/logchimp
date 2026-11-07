import type { components, operations } from "@logchimp/api-ts-types";

import { VITE_API_URL } from "../../constants";

// store
import { APIService } from "../../modules/api";

export class RolesEEAPI extends APIService {
  constructor(baseURL?: string) {
    super(baseURL || `${VITE_API_URL}/api`);
  }

  /**
   * Get role by UUID
   * @param {string} id role id
   * @returns {Promise<components['schemas]]['GetRoleByIdResponseBody]>} response
   */
  GetRole = async (
    id: string,
  ): Promise<components["schemas"]["GetRoleByIdResponseBody"]> => {
    return this.get(`/v1/roles/${encodeURIComponent(id)}`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };

  /**
   * Create role
   * @returns {Promise<components['schemas]>['CreateRoleResponseBody']} response
   */
  CreateRole = async (): Promise<
    components["schemas"]["CreateRoleResponseBody"]
  > => {
    return this.post("/v1/roles")
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };

  /**
   * Update a role
   * @param {object} role update role
   * @param {string} role.id role id
   * @param {string} role.name role name
   * @param {string} role.description role description
   * @param {string[]} role.permissions list of permission
   * @returns {Promise<components["schemas"]["UpdateRoleResponseBody"]>} response
   */
  UpdateRole = async (
    role: components["schemas"]["UpdateRoleRequestBody"],
  ): Promise<components["schemas"]["UpdateRoleResponseBody"]> => {
    return this.patch("/v1/roles", role)
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };

  async GetAll(
    params: operations["filterRoles"]["parameters"]["query"] = {},
  ): Promise<components["schemas"]["GetFilterRolesResponseBody"]> {
    const searchParams = this.buildQueryParams(params);

    const url = `/v1/roles?${searchParams.toString()}`;

    return this.get(url)
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  }
}

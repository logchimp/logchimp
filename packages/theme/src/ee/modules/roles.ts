import type {
  ICreateRoleResponseBody,
  IGetRoleByIdResponseBody,
  IGetRolesParams,
  IPaginatedRolesResponse,
  IUpdateRoleRequestBody,
  IUpdateRoleResponseBody,
} from "@logchimp/types";

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
   * @returns {Promise<IGetRoleByIdResponseBody>} response
   */
  GetRole = async (id: string): Promise<IGetRoleByIdResponseBody> => {
    return this.get(`/v1/roles/${encodeURIComponent(id)}`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };

  /**
   * Create role
   * @returns {Promise<ICreateRoleResponseBody>} response
   */
  CreateRole = async (): Promise<ICreateRoleResponseBody> => {
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
   * @returns {Promise<IUpdateRoleResponseBody>} response
   */
  UpdateRole = async (
    role: IUpdateRoleRequestBody,
  ): Promise<IUpdateRoleResponseBody> => {
    return this.patch("/v1/roles", role)
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };

  async GetAll(params: IGetRolesParams = {}): Promise<IPaginatedRolesResponse> {
    const searchParams = new URLSearchParams();

    for (const paramsKey in params) {
      const value = params[paramsKey as keyof IGetRolesParams];
      if (value) {
        searchParams.append(paramsKey, value.toString());
      }
    }

    const url = `/v1/roles${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;

    return this.get(url)
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  }
}

import type { AxiosResponse } from "axios";
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
   * @returns {Promise<AxiosResponse<IGetRoleByIdResponseBody>>} response
   */
  GetRole = async (
    id: string,
  ): Promise<AxiosResponse<IGetRoleByIdResponseBody>> => {
    return this.get(`/v1/roles/${encodeURIComponent(id)}`);
  };

  /**
   * Create role
   * @returns {Promise<AxiosResponse<ICreateRoleResponseBody>>} response
   */
  CreateRole = async (): Promise<AxiosResponse<ICreateRoleResponseBody>> => {
    return this.post("/v1/roles");
  };

  /**
   * Update a role
   * @param {object} role update role
   * @param {string} role.id role id
   * @param {string} role.name role name
   * @param {string} role.description role description
   * @param {string[]} role.permissions list of permission
   * @returns {Promise<AxiosResponse<IUpdateRoleResponseBody>>} response
   */
  UpdateRole = async (
    role: IUpdateRoleRequestBody,
  ): Promise<AxiosResponse<IUpdateRoleResponseBody>> => {
    return this.put("/v1/roles", role);
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

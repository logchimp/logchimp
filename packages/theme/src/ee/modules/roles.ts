import axios, { type AxiosResponse } from "axios";
import type {
  ICreateRoleResponseBody,
  IGetAllRoles,
  IGetRoleByIdResponseBody,
  IUpdateRoleRequestBody,
  IUpdateRoleResponseBody,
} from "@logchimp/types";

import { VITE_API_URL } from "../../constants";

// store
import { useUserStore } from "../../store/user";
import { APIService } from "../../modules/api";

/**
 * Get role by UUID
 * @param {string} id role id
 * @returns {Promise<AxiosResponse<IGetRoleByIdResponseBody>>} response
 */
export const getRole = async (
  id: string,
): Promise<AxiosResponse<IGetRoleByIdResponseBody>> => {
  const { authToken } = useUserStore();

  return await axios({
    method: "GET",
    url: `${VITE_API_URL}/api/v1/roles/${id}`,
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

/**
 * Create role
 * @returns {Promise<AxiosResponse<ICreateRoleResponseBody>>} response
 */
export const createRole = async (): Promise<
  AxiosResponse<ICreateRoleResponseBody>
> => {
  const { authToken } = useUserStore();

  return await axios({
    method: "POST",
    url: `${VITE_API_URL}/api/v1/roles`,
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
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
export const updateRole = async (
  role: IUpdateRoleRequestBody,
): Promise<AxiosResponse<IUpdateRoleResponseBody>> => {
  const { authToken } = useUserStore();

  return await axios({
    method: "PATCH",
    url: `${VITE_API_URL}/api/v1/roles`,
    data: {
      ...role,
    },
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

export class Roles extends APIService {
  constructor(baseURL?: string) {
    super(baseURL || `${VITE_API_URL}/api`);
  }

  async getAll(): Promise<IGetAllRoles> {
    return this.get("/v1/roles")
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  }
}

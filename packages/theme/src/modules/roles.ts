// packges
import axios, { AxiosResponse } from "axios";

// store
import { useUserStore } from "../store/user";

interface UpdateRoleArgs {
  id: string;
  name: string;
  description: string;
  // TODO: Add TS types
  // biome-ignore lint: Add TS types
  permissions: any;
}

/**
 *	Get all roles
 *
 * @returns {object} response
 */
export const getAllRoles = async () => {
  const { authToken } = useUserStore();

  return await axios({
    method: "GET",
    url: "/api/v1/roles",
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

/**
 *	Get role by UUID
 *
 * @param {string} id role id
 *
 * @returns {object} response
 */
export const getRole = async (id: string) => {
  const { authToken } = useUserStore();

  return await axios({
    method: "GET",
    url: `/api/v1/roles/${id}`,
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

/**
 *	Create role
 *
 * @returns {object} response
 */
export const createRole = async (): Promise<
  AxiosResponse<{
    role: {
      id: string;
    };
  }>
> => {
  const { authToken } = useUserStore();

  return await axios({
    method: "POST",
    url: "/api/v1/roles",
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

/**
 * Updatae a role
 *
 * @param {object} role update role
 * @param {string} role.id role id
 * @param {string} role.name role name
 * @param {string} role.description role description
 * @param {string[]} role.permissions list of permission
 *
 * @returns {object} response
 */
export const updateRole = async (role: UpdateRoleArgs) => {
  const { authToken } = useUserStore();

  return await axios({
    method: "PATCH",
    url: "/api/v1/roles",
    data: {
      ...role,
    },
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

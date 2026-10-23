import type { components, operations } from "@logchimp/api-ts-types";

// store
import { APIService } from "./api";
import { VITE_API_URL } from "../constants";

export class UsersAPI extends APIService {
  constructor(baseURL?: string) {
    super(baseURL || `${VITE_API_URL}/api`);
  }

  /**
   * @param {Partial<operations['filterUsers']['parameters']['query']>} [params={}] - URL parameters
   * @returns {Promise<components["schemas"]["GetUserResponseBody"]>}
   */
  async GetAll(
    params: Partial<operations["filterUsers"]["parameters"]["query"]> = {},
  ): Promise<components["schemas"]["GetUsersResponseBody"]> {
    return this.get("/v1/users", params)
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  }
}

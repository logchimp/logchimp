import type {
  IGetUsersRequestQuery,
  IGetUsersResponseBody,
} from "@logchimp/types";

// store
import { APIService } from "./api";
import { VITE_API_URL } from "../constants";

export class UsersAPI extends APIService {
  constructor(baseURL?: string) {
    super(baseURL || `${VITE_API_URL}/api`);
  }

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

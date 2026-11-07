import type { AxiosError } from "axios";
import type { components } from "@logchimp/api-ts-types";

import { APIService } from "../../modules/api";
import { VITE_API_URL } from "../../constants";

export class SettingsEE extends APIService {
  constructor(baseURL?: string) {
    super(baseURL || `${VITE_API_URL}/api`);
  }

  async checkLicense(): Promise<
    components["schemas"]["CheckLicenseControllerResponseBody"]
  > {
    return this.get(`/v1/license`)
      .then((response) => response?.data)
      .catch((error: AxiosError) => {
        throw error;
      });
  }
}

import type { ICheckLicenseDecryptedPayload } from "@logchimp/types";

import { APIService } from "../../modules/api.ts";
import { VITE_API_URL } from "../../constants.ts";

export class SettingsEE extends APIService {
  constructor(baseURL?: string) {
    super(baseURL || `${VITE_API_URL}/api`);
  }

  async checkLicense(): Promise<ICheckLicenseDecryptedPayload> {
    return this.get(`/v1/license`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  }
}

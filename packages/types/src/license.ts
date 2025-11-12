export type TLicenseSubscriptionType =
  | "free"
  | "starter"
  | "growth"
  | "enterprise";

export interface ICheckLicenseRequestBody {
  license_key: string;
  metadata: {
    version: string;
    deploymentProvider: string | "unknown";
  };
  timestamp: string;
}

export interface ICheckLicenseResponseBody {
  encrypted_payload: string;
  timestamp: Date;
}

export interface ICheckLicenseDecryptedPayload {
  response_nonce: string;
  license_key: string;
  server_time: string;
  status: string;
  subscription_type: TLicenseSubscriptionType;
}

export interface ILicenseServiceResponse extends ICheckLicenseDecryptedPayload {
  hierarchy: number;
}

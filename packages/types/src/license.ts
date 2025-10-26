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
  server_time: string;
  status: string;
  // features: string[];
}

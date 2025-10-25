export interface ICheckLicenseRequestBody {
  license_key: string;
  machine_signature: string;
  timestamp: string;
}

export interface ICheckLicenseResponseBody {
  status: boolean;
  timestamp: Date;
  // encrypted_payload: string;
}

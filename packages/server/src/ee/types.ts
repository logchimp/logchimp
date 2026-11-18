import type { TLicenseSubscriptionType } from "../types";

export interface ILicenseGuardMiddleware {
  subscription_type: TLicenseSubscriptionType;
  hierarchy: number;
}

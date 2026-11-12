import type { components } from "@logchimp/api-ts-types";

export type TCreatedUser = Omit<components["schemas"]["AuthUser"], "authToken">;

export type CreateUserOptions = {
  user?: {
    password?: string;
    name?: string;
    avatar?: string;
  };
  options?: {
    sendAccountVerificationEmail?: boolean;
  };
};

export type OpenIDConnectUserIdentity = {
  issuer: string;
  subject: string;
  name?: string;
  email: string;
  emailVerified?: boolean;
  picture?: string;
};

export const OIDC_AUTHENTICATION_ERROR_CODES = [
  "access_denied",
  "invalid_request",
  "unauthorized_client",
  "unsupported_response_type",
  "invalid_scope",
  "server_error",
  "temporarily_unavailable",
  "interaction_required",
  "login_required",
  "account_selection_required",
  "consent_required",
  // fallback for anything outside the spec's known set
  "authorization_failed",
] as const;

export type OIDCAuthenticationErrorCode =
  (typeof OIDC_AUTHENTICATION_ERROR_CODES)[number];

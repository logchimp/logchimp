import * as oidc from "openid-client";
import { config } from "../../utils/logchimpConfig";
import cache from "../../cache";
import { sanitizeHttpUrl } from "../../helpers";

const OIDC_TRANSACTION_TTL = 300; // 5 minutes

type OIDCTransaction = {
  codeVerifier: string;
  nonce: string;
  state: string;
};

export class OIDCService {
  private async getConfiguration() {
    const issuer = new URL(config.oidcIssuer);

    return await oidc.discovery(
      issuer,
      config.oidcClientId,
      config.oidcClientSecret,
    );
  }

  async CreateAuthorizationUrl() {
    const oidcConfiguration = await this.getConfiguration();

    const codeVerifier = oidc.randomPKCECodeVerifier();
    const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier);

    const state = oidc.randomState();
    const nonce = oidc.randomNonce();

    const transaction: OIDCTransaction = {
      codeVerifier,
      nonce,
      state,
    };

    await cache.set(
      `oidc:transaction:${state}`,
      JSON.stringify(transaction),
      "EX",
      OIDC_TRANSACTION_TTL,
    );

    const redirectURI = sanitizeHttpUrl(
      `${config.apiUrl}/api/v1/auth/oidc/callback`,
    );

    const authorizationUrl = oidc.buildAuthorizationUrl(oidcConfiguration, {
      redirect_uri: redirectURI,
      scope: "openid profile email",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      state,
      nonce,
    });

    return {
      authorizationUrl,
    };
  }
}

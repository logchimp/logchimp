import * as oidc from "openid-client";
import { config } from "../../utils/logchimpConfig";
import cache from "../../cache";
import { sanitizeHttpUrl } from "../../helpers";
import { AuthenticationFailedError } from "./errors";
import { AuthService } from "./auth.service";

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

  async Authenticate(currentUrl: URL, state: string) {
    const transactionCache = await cache.getdel(`oidc:transaction:${state}`);

    if (!transactionCache) {
      throw new AuthenticationFailedError();
    }

    const transaction = JSON.parse(transactionCache) as OIDCTransaction;

    const oidcConfiguration = await this.getConfiguration();

    const tokens = await oidc.authorizationCodeGrant(
      oidcConfiguration,
      currentUrl,
      {
        pkceCodeVerifier: transaction.codeVerifier,
        expectedState: transaction.state,
        expectedNonce: transaction.nonce,
        idTokenExpected: true,
      },
    );

    const claims = tokens.claims();

    if (!claims) {
      throw new AuthenticationFailedError();
    }

    const issuer = claims.iss;
    const subject = claims.sub;

    if (!issuer || !subject) {
      throw new AuthenticationFailedError();
    }

    const email =
      typeof claims.email === "string" ? claims.email.trim().toLowerCase() : "";

    const name = typeof claims.name === "string" ? claims.name.trim() : "";

    const emailVerified =
      typeof claims.email_verified === "boolean"
        ? claims.email_verified
        : undefined;

    if (!email) {
      throw new AuthenticationFailedError();
    }

    const authService = new AuthService();

    const user = await authService.GetOrCreateOpenIDConnectUser({
      issuer,
      subject,
      name,
      email,
      emailVerified,
      picture: typeof claims.picture === "string" ? claims.picture : undefined,
    });

    return user;
  }
}

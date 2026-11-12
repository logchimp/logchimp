import type { Request, Response } from "express";
import type { components } from "@logchimp/api-ts-types";
import { config } from "../../../utils/logchimpConfig";
import { OIDCService } from "../../../services/auth/oidc.service";
import { AuthService } from "../../../services/auth/auth.service";
import {
  AuthenticationFailedError,
  OIDCAuthenticationFailedError,
} from "../../../services/auth/errors";
import logger from "../../../utils/logger";
import { domainBlacklistManager } from "../../services/auth/auth.service";
import error from "../../../errorResponse.json";

const oidcService = new OIDCService();
const authService = new AuthService();

type OIDCLoginCallbackResponse =
  components["schemas"]["GenericAPIErrorResponseBody"];

export async function OIDCLoginCallback(
  req: Request,
  res: Response<OIDCLoginCallbackResponse>,
) {
  const redirectURI = new URL(`${config.webUrl}/oauth/logchimp`);

  const stateParam = req.query.state;
  const oidcState = typeof stateParam === "string" ? stateParam.trim() : "";
  if (!oidcState) {
    redirectURI.searchParams.set("error", "invalid_state");
    res.redirect(redirectURI.toString());
    return;
  }

  const currentUrl = new URL(config.apiUrl + req.originalUrl);

  try {
    let user: components["schemas"]["CustomerItemInfo"];
    try {
      const identity = await oidcService.VerifyCallback(currentUrl, oidcState);

      if (domainBlacklistManager.isBlacklisted(identity.email)) {
        redirectURI.searchParams.set("error", "email_domain_blacklisted");
        redirectURI.searchParams.set(
          "error_description",
          error.api.authentication.emailDomainBlacklisted,
        );
        res.redirect(redirectURI.toString());
        return;
      }

      user = await authService.GetOrCreateOpenIDConnectUser(identity);
    } catch (err) {
      if (err instanceof OIDCAuthenticationFailedError) {
        redirectURI.searchParams.set("error", err.code);
        res.redirect(redirectURI.toString());
        return;
      }
      throw err;
    }

    const authToken = authService.generateUserAuthToken(
      user.userId,
      user.email,
    );

    const webURL = new URL(config.webUrl);
    res.cookie("lc-auth-token", authToken, {
      domain: webURL.hostname,
      secure: true,
      // 10 minutes
      path: "/oauth/logchimp",
      maxAge: 1000 * 60 * 10,
      sameSite: "none",
    });

    res.redirect(redirectURI.toString());
  } catch (err) {
    if (err instanceof AuthenticationFailedError) {
      redirectURI.searchParams.set("error", "not_allowed");
      res.redirect(redirectURI.toString());
      return;
    }

    logger.error({
      message: "Failed to authenticate using OpenID Connect",
      error: err,
    });

    res.status(500).send({
      message: "Internal Server Error",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
}

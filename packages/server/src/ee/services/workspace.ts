import type { components } from "@logchimp/api-ts-types";

import type { IAuthenticationMiddlewareUser } from "../../types";
import { workspaceRepository } from "../repository/workspace";
import type { ILicenseGuardMiddleware } from "../types";

type SiteSettings = components["schemas"]["SiteSettings"];
type PublicSiteSettings = components["schemas"]["PublicSiteSettings"];
type InternalSiteSettings = components["schemas"]["InternalSiteSettings"];

/**
 * Keys of `InternalSiteSettings` that must be removed before the settings are
 * returned to callers without the `settings:read` permission.
 */
const SENSITIVE_SETTINGS = ["blockedDomains"] as const satisfies ReadonlyArray<
  keyof InternalSiteSettings
>;

export class WorkspaceService {
  workspaceRepo: workspaceRepository;

  constructor() {
    this.workspaceRepo = new workspaceRepository();
  }

  /**
   * Returns site settings, including sensitive fields only when the caller has
   * the `settings:read` permission and a paid license.
   *
   * `user` comes from `req.user` (populated by the auth middleware). The
   * service never reads the request itself, which keeps it usable from
   * non-HTTP callers too.
   */
  async GetSettings(
    user?: IAuthenticationMiddlewareUser,
    subscription?: ILicenseGuardMiddleware,
  ): Promise<SiteSettings | PublicSiteSettings> {
    const settings = await this.workspaceRepo.GetSettings();

    return this.canViewSensitiveSettings(user, subscription)
      ? settings
      : this.omitSensitiveSettings(settings);
  }

  private canViewSensitiveSettings(
    user?: IAuthenticationMiddlewareUser,
    subscription?: ILicenseGuardMiddleware,
  ): boolean {
    if (!user?.userId || user.isBlocked) {
      return false;
    }

    const hasPermission =
      user.isOwner || user.permissions.includes("settings:read");
    const hasSubscription =
      subscription !== undefined && subscription.hierarchy >= 1;

    return hasPermission && hasSubscription;
  }

  private omitSensitiveSettings(settings: SiteSettings): PublicSiteSettings {
    const publicSettings = { ...settings };

    for (const key of SENSITIVE_SETTINGS) {
      delete publicSettings[key];
    }

    return publicSettings;
  }
}

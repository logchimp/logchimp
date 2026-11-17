import type { components } from "@logchimp/api-ts-types";

import type { IAuthenticationMiddlewareUser } from "../../types";
import { workspaceRepository } from "../repository/workspace";

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
   * Returns site settings, including sensitive fields only when the caller is
   * allowed to see them.
   *
   * `user` comes from `req.user` (populated by the auth middleware). The
   * service never reads the request itself, which keeps it usable from
   * non-HTTP callers too.
   */
  async GetSettings(
    user?: IAuthenticationMiddlewareUser,
  ): Promise<SiteSettings | PublicSiteSettings> {
    const canViewSensitive =
      user !== undefined &&
      Boolean(user.userId) &&
      !user.isBlocked &&
      (user.isOwner || user.permissions.includes("settings:read"));

    const settings = await this.workspaceRepo.GetSettings();

    if (canViewSensitive) {
      return settings;
    }

    return this.omitSensitiveSettings(settings);
  }

  private omitSensitiveSettings(settings: SiteSettings): PublicSiteSettings {
    const publicSettings: Partial<SiteSettings> = { ...settings };

    for (const key of SENSITIVE_SETTINGS) {
      delete publicSettings[key];
    }

    return publicSettings as PublicSiteSettings;
  }
}

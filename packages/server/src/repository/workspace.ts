import type { components } from "@logchimp/api-ts-types";

import * as cache from "../cache";
import { CACHE_KEYS } from "../cache/keys";
import logger from "../utils/logger";
import database from "../database";
import { DAY } from "../cache/time";
import { SiteNameOrLogoRequiredError } from "../services/workspace/error";

type SiteNameOrLogo = {
  title?: string | null;
  logo?: string | null;
};

export class workspaceRepository {
  async GetSettings() {
    if (cache.isActive) {
      try {
        const cached = await cache.valkey.get(CACHE_KEYS.SITE_SETTINGS);
        if (cached) {
          return JSON.parse(cached) as components["schemas"]["SiteSettings"];
        }
      } catch (err) {
        logger.error({ message: err });
      }
    }

    try {
      const settings = await database("settings")
        .select<components["schemas"]["SiteSettings"]>(
          "*",
          database.raw("labs::json as labs"),
        )
        .first();

      if (cache.isActive) {
        try {
          await cache.valkey.set(
            CACHE_KEYS.SITE_SETTINGS,
            JSON.stringify(settings),
            "EX",
            7 * DAY,
          );
        } catch (err) {
          logger.error({ message: err });
        }
      }

      return settings;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Update settings within a transaction, optionally validating the name-or-logo invariant.
   * @param settings - Settings to update
   * @throws {Error} If both title and logo would be empty after update
   */
  async UpdateSettings(
    settings: Partial<{
      title: string;
      description: string;
      logo: string;
      allowSignup: boolean;
      accentColor: string;
      googleAnalyticsId: string;
      developer_mode: boolean;
    }>,
  ) {
    const updatedSettingsTrx = await database.transaction(async (trx) => {
      const currentSettings = await trx("settings")
        .select("*", trx.raw("labs::json as labs"))
        .forUpdate()
        .first();

      if (
        !this.hasSiteNameOrLogo(settings, {
          title: currentSettings?.title,
          logo: currentSettings?.logo,
        })
      ) {
        throw new SiteNameOrLogoRequiredError();
      }

      const updateData: Record<string, string | boolean | null> = {};
      if (settings.title !== undefined) updateData.title = settings.title;
      if (settings.description !== undefined)
        updateData.description = settings.description;
      if (settings.logo !== undefined) {
        updateData.logo = settings.logo;
        updateData.icon = settings.logo;
      }
      if (settings.allowSignup !== undefined)
        updateData.allowSignup = settings.allowSignup;
      if (settings.accentColor !== undefined)
        updateData.accentColor = settings.accentColor;
      if (settings.googleAnalyticsId !== undefined)
        updateData.googleAnalyticsId = settings.googleAnalyticsId;
      if (settings.developer_mode !== undefined)
        updateData.developer_mode = settings.developer_mode;

      if (Object.keys(updateData).length === 0) {
        return currentSettings;
      }

      await trx("settings").update(updateData);

      return (await trx("settings")
        .select("*", trx.raw("labs::json as labs"))
        .first()) as components["schemas"]["SiteSettings"];
    });

    if (cache.isActive) {
      try {
        await cache.valkey.del(CACHE_KEYS.SITE_SETTINGS);
      } catch (err) {
        logger.error({
          message: "failed to delete site settings cache",
          error: err,
        });
      }
    }

    return updatedSettingsTrx;
  }

  /**
   * At least one of site name or logo must remain after the update.
   * Fields absent from `body` fall back to the `current` settings.
   */
  private hasSiteNameOrLogo(
    body: SiteNameOrLogo,
    current: SiteNameOrLogo | undefined,
  ): boolean {
    const title = (
      body.title !== undefined ? (body.title ?? "") : (current?.title ?? "")
    ).trim();
    const logo = (
      body.logo !== undefined ? (body.logo ?? "") : (current?.logo ?? "")
    ).trim();

    return Boolean(title || logo);
  }
}

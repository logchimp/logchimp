import type { components } from "@logchimp/api-ts-types";

import * as cache from "../cache";
import { CACHE_KEYS } from "../cache/keys";
import logger from "../utils/logger";
import database from "../database";
import { DAY } from "../cache/time";

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
    await database
      .update({
        title: settings.title,
        description: settings.description,
        logo: settings.logo,
        icon: settings.logo,
        allowSignup: settings.allowSignup,
        accentColor: settings.accentColor,
        googleAnalyticsId: settings.googleAnalyticsId,
        developer_mode: settings.developer_mode,
      })
      .from("settings");

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

    return await this.GetSettings();
  }
}

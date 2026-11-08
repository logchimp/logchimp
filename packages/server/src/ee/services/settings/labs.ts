import type { components } from "@logchimp/api-ts-types";

import logger from "../../../utils/logger";
import database from "../../../database";

export async function isFeatureEnabled(
  feature: keyof components["schemas"]["SiteSettingsLabs"],
): Promise<boolean> {
  if (!feature) return false;

  try {
    const labSettings = await database
      .select<{ labs: components["schemas"]["SiteSettingsLabs"] }>(
        database.raw("labs::json"),
      )
      .from("settings")
      .first();

    return labSettings.labs[feature] === true;
  } catch (err) {
    logger.error({
      message: err,
    });

    return false;
  }
}

import type { ISiteSettingsLab } from "@logchimp/types";

import logger from "../../../utils/logger";
import database from "../../../database";

export async function isFeatureEnabled(
  feature: keyof ISiteSettingsLab,
): Promise<boolean> {
  if (!feature) return false;

  try {
    const labSettings = (await database
      .select(database.raw("labs::json"))
      .from("settings")
      .first()) as unknown as { labs: ISiteSettingsLab };

    return labSettings.labs[feature] === true;
  } catch (err) {
    logger.error({
      message: err,
    });

    return false;
  }
}

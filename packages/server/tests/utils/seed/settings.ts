import type { components } from "@logchimp/api-ts-types";

import database from "../../../src/database";

type TUpdateSettingsInternal = Partial<
  Omit<components["schemas"]["SiteSettings"], "icon">
>;

/**
 * NOTE: This function does not create faker data to update settings.
 * @param settings
 */
export async function updateSettings(
  settings?: TUpdateSettingsInternal,
): Promise<TUpdateSettingsInternal> {
  const obj: Partial<components["schemas"]["SiteSettings"]> = settings;

  if (settings?.logo) {
    obj.logo = settings.logo;
    obj.icon = settings.logo;
  }

  await database.update(obj).into("settings");

  return obj;
}

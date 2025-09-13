import type { ISiteSettings } from "@logchimp/types";
import database from "../../../src/database";

type TUpdateSettingsInternal = Partial<Omit<ISiteSettings, "icon">>;

/**
 * NOTE: This function does not create faker data to update settings.
 * @param settings
 */
export async function updateSettings(
  settings?: TUpdateSettingsInternal,
): Promise<TUpdateSettingsInternal> {
  const obj: Partial<ISiteSettings> = settings;

  if (settings?.logo) {
    obj.logo = settings.logo;
    obj.icon = settings.logo;
  }

  await database.update(obj).into("settings");

  return obj;
}

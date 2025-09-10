import { ISiteSettings } from "@logchimp/types";
import database from "../../../src/database";
import { faker } from "@faker-js/faker";

export async function updateSettings(
  settings?: Partial<ISiteSettings>,
  updateToDb = false,
): Promise<Partial<ISiteSettings>> {
  const title = settings?.title || faker.company.name();
  const description = settings?.description || faker.company.buzzPhrase();
  const googleAnalyticsId = settings?.googleAnalyticsId || faker.string.uuid();
  const isPoweredBy = settings?.isPoweredBy || true;
  const allowSignup = settings?.allowSignup || true;
  const developer_mode = settings?.developer_mode || false;
  const labs = {
    comments: settings?.labs?.comments || faker.datatype.boolean(),
  };

  const obj: Partial<ISiteSettings> = {
    title,
    description,
    accentColor: faker.color.rgb({
      format: "hex",
      casing: "lower",
      prefix: "",
    }),
    googleAnalyticsId,
    isPoweredBy,
    allowSignup,
    developer_mode,
    labs,
  };

  if (settings?.logo) {
    obj.logo = settings.logo;
  }

  if (settings?.icon) {
    obj.icon = settings.icon;
  }

  if (updateToDb) {
    await database.update(obj).into("settings");
  }

  return obj;
}

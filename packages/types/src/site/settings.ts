export interface ISiteSettings {
  title: string | null;
  description: string | null;
  logo: string | null;
  icon: string | null;
  accentColor: string | null;
  googleAnalyticsId: string | null;
  isPoweredBy: boolean;
  allowSignup: boolean;
  developer_mode: boolean;
  hasValidLicense: boolean;
  labs: ISiteSettingsLab;
}

export interface ISiteSettingsLab {
  comments: boolean;
}

export interface IGetSiteSettingsResponseBody {
  settings: ISiteSettings;
}

export type TGetSiteSettingsLabResponseBody = {
  labs: Partial<ISiteSettingsLab>;
};

export interface IUpdateSiteSettingsRequestBody {
  title: string | null;
  description: string | null;
  logo: string | null;
  allowSignup: boolean | null;
  accentColor: string | null;
  googleAnalyticsId: string | null;
  developer_mode: boolean;
}

export type TUpdateSiteSettingsResponseBody = IGetSiteSettingsResponseBody;

export type TUpdateSiteSettingsLabRequestBody = Partial<ISiteSettingsLab>;
export type TUpdateSiteSettingsLabResponseBody =
  TGetSiteSettingsLabResponseBody;

export interface ISettings {
  title: string;
  description: string;
  logo: string;
  icon: string;
  accentColor: string;
  googleAnalyticsId: string;
  isPoweredBy: boolean;
  allowSignup: boolean;
  developer_mode: boolean;
  labs: ISettingsLab;
}

export interface ISettingsLab {
  comments: boolean;
}

export type TGetLabsResponseBody = {
  labs: Partial<ISettingsLab>;
};

export type TUpdateLabsRequestBody = Partial<ISettingsLab>;
export type TUpdateLabsResponseBody = TGetLabsResponseBody;

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

  labs: Labs;
}

interface Labs {
  comments: boolean;
}

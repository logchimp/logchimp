export interface ISettingsLab {
  comments: boolean;
}

export type TGetLabsResponseBody = {
  labs: Partial<ISettingsLab>;
};

export type TUpdateLabsRequestBody = Partial<ISettingsLab>;
export type TUpdateLabsResponseBody = TGetLabsResponseBody;

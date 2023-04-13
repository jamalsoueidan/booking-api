import { SettingModel } from "./setting.model";
import { Setting } from "./setting.types";

export const SettingServiceGet = () => {
  return SettingModel.findOne();
};

export type SettingBodyUpdate = Partial<Omit<Setting, "_id" | "shop">>;

export const SettingServiceFindOneAndUpdate = (body: SettingBodyUpdate) => {
  return SettingModel.findOneAndUpdate({}, body, {
    new: true,
    upsert: true,
  });
};

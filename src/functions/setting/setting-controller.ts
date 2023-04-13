import { z } from "zod";
import { _, onlyOwner } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import {
  SettingServiceFindOneAndUpdate,
  SettingServiceGet,
} from "./setting.service";
import { Setting, SettingZodSchema } from "./setting.types";

export type SettingControllerGetResponse = Setting;

export const SettingControllerGet = _(jwtVerify, onlyOwner, () => {
  return SettingServiceGet();
});

export type SettingControllerUpdateRequest = {
  body: z.infer<typeof SettingControllerUpdateBodySchema>;
};

export const SettingControllerUpdateBodySchema = SettingZodSchema.omit({
  _id: true,
});

export type SettingControllerUpdateResponse = Setting;

export const SettingControllerUpdate = _(
  jwtVerify,
  onlyOwner,
  async ({ body }: SettingControllerUpdateRequest) => {
    const validateBody = SettingControllerUpdateBodySchema.parse(body);
    return SettingServiceFindOneAndUpdate(validateBody);
  }
);

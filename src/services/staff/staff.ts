import {
  StaffModel,
  StaffServiceCreateNewPassword,
  StaffServiceLogin,
} from "@jamalsoueidan/backend.services.staff";

import { z } from "zod";
import { jwtCreateToken } from "../../lib/jwt";

export const ShopSchema = z.object({
  shop: z.string(),
});

export const StaffServiceLoginAndCreateTokenSchema = ShopSchema.extend({
  identification: z.string(),
  password: z.string(),
});

export type StaffServiceLoginAndCreateTokenProps = z.infer<
  typeof StaffServiceLoginAndCreateTokenSchema
>;

export const StaffServiceLoginAndCreateToken = async (
  props: StaffServiceLoginAndCreateTokenProps
) => {
  StaffServiceLoginAndCreateTokenSchema.parse(props);
  const staff = await StaffServiceLogin(props);
  if (!staff) {
    throw new Error("wrong user/password");
  }
  return { token: jwtCreateToken(staff) };
};

export const StaffServiceReceivePasswordSchema = ShopSchema.extend({
  phone: z.string(),
});

export type StaffServiceReceivePasswordProps = z.infer<
  typeof StaffServiceReceivePasswordSchema
>;

export const StaffServiceReceivePassword = async (
  props: StaffServiceReceivePasswordProps
) => {
  StaffServiceReceivePasswordSchema.parse(props);

  const staff = await StaffModel.findOne(props);

  if (!staff) {
    throw { message: "phone number not exist" };
  }

  const password = await StaffServiceCreateNewPassword(staff);

  /*SmsDkApiSend({
      receiver: staff.phone,
      message: `Din adgangskode: ${password}`,
    });*/

  return {
    message: "Check your phone",
    ...(process.env["AZURE_FUNCTIONS_ENVIRONMENT"] === "Development"
      ? { password }
      : {}),
  };
};

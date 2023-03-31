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

export const AuthServiceLoginSchema = ShopSchema.extend({
  identification: z.string(),
  password: z.string(),
});

export type AuthServiceLoginProps = z.infer<typeof AuthServiceLoginSchema>;

export const AuthServiceLogin = async (props: AuthServiceLoginProps) => {
  AuthServiceLoginSchema.parse(props);
  const staff = await StaffServiceLogin(props);
  if (!staff) {
    throw new Error("identification or password is incorrect");
  }
  return { token: jwtCreateToken(staff) };
};

export const AuthServiceReceivePasswordSchema = ShopSchema.extend({
  phone: z.string(),
});

export type AuthServiceReceivePasswordProps = z.infer<
  typeof AuthServiceReceivePasswordSchema
>;

export const AuthServiceReceivePassword = async (
  props: AuthServiceReceivePasswordProps
) => {
  AuthServiceReceivePasswordSchema.parse(props);

  const staff = await StaffModel.findOne(props);

  if (!staff) {
    throw new Error("phone number not exist");
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

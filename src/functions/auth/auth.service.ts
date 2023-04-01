import { z } from "zod";
import { jwtCreateToken } from "../../library/jwt";
import { UserModel } from "../user/user.model";
import {
  UserServiceCreateNewPassword,
  UserServiceLogin,
} from "../user/user.service";

export const AuthServiceLoginSchema = z.object({
  identification: z.string(),
  password: z.string(),
});

export type AuthServiceLoginProps = z.infer<typeof AuthServiceLoginSchema>;

export const AuthServiceLogin = async (props: AuthServiceLoginProps) => {
  AuthServiceLoginSchema.parse(props);
  const user = await UserServiceLogin(props);
  if (!user) {
    throw new Error("identification or password is incorrect");
  }
  return { token: jwtCreateToken(user) };
};

export const AuthServiceReceivePasswordSchema = z.object({
  phone: z.string(),
});

export type AuthServiceReceivePasswordProps = z.infer<
  typeof AuthServiceReceivePasswordSchema
>;

export const AuthServiceReceivePassword = async (
  props: AuthServiceReceivePasswordProps
) => {
  AuthServiceReceivePasswordSchema.parse(props);

  const user = await UserModel.findOne(props);

  if (!user) {
    throw new Error("phone number not exist");
  }

  const password = await UserServiceCreateNewPassword(user);

  /*SmsDkApiSend({
      receiver: user.phone,
      message: `Din adgangskode: ${password}`,
    });*/

  return {
    message: "Check your phone",
    ...(process.env["AZURE_FUNCTIONS_ENVIRONMENT"] === "Development"
      ? { password }
      : {}),
  };
};

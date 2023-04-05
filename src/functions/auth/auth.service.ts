import { compare } from "bcryptjs";
import { generate } from "generate-password";
import { z } from "zod";
import { jwtCreateToken } from "~/library/jwt";
import { AuthModel } from "./auth.model";
import { Auth } from "./auth.types";

export const AuthServiceLoginSchema = z.object({
  identification: z.string(),
  password: z.string(),
});

export type AuthServiceLoginProps = z.infer<typeof AuthServiceLoginSchema>;

export const AuthServiceLogin = async (props: AuthServiceLoginProps) => {
  AuthServiceLoginSchema.parse(props);

  const auth = await AuthModel.findOne({
    $or: [{ phone: props.identification }, { email: props.identification }],
    active: true,
  });

  if (!auth) {
    throw new Error("identification or password is incorrect");
  }

  const correctPassword = await compare(props.password, auth.password || "");
  if (!correctPassword) {
    throw new Error("identification or password is incorrect");
  }

  return { token: jwtCreateToken(auth.toJSON()) };
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

  const user = await AuthModel.findOne(props);

  if (!user) {
    throw new Error("phone number not exist");
  }

  const password = generate({
    length: 6,
    numbers: true,
    symbols: false,
    uppercase: false,
  });

  user.password = password;
  user.save();

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

export type AuthCreateBodyRequest = Omit<Auth, "_id" | "password">;

export const AuthServiceCreate = (body: AuthCreateBodyRequest) =>
  AuthModel.create(body);

export const AuthServiceUpdate = (
  filter: Partial<Auth>,
  body: Partial<AuthCreateBodyRequest>
) => AuthModel.findOneAndUpdate(filter, body);

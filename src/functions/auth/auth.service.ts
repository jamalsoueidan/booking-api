import { compare } from "bcryptjs";
import { generate } from "generate-password";
import { UnauthorizedError } from "~/library/handler";
import { jwtCreateToken } from "~/library/jwt";
import { AuthModel } from "./auth.model";
import { Auth } from "./auth.types";

export type AuthServiceLoginProps = {
  identification: string;
  password: string;
};

export const AuthServiceLogin = async (props: AuthServiceLoginProps) => {
  const auth = await AuthModel.findOne({
    $or: [{ phone: props.identification }, { email: props.identification }],
    active: true,
  });

  if (!auth) {
    throw new UnauthorizedError("identification or password is incorrect");
  }

  const correctPassword = await compare(props.password, auth.password || "");
  if (!correctPassword) {
    throw new UnauthorizedError("identification or password is incorrect");
  }

  return { token: jwtCreateToken(auth.toJSON()) };
};

export type AuthServiceReceivePasswordProps = {
  phone: string;
};

export const AuthServiceReceivePassword = async (
  props: AuthServiceReceivePasswordProps
) => {
  const user = await AuthModel.findOne(props);

  if (!user) {
    throw new UnauthorizedError("phone number not exist");
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

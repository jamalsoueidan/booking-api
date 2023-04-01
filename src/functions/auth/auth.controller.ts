import { HandlerProps } from "../../library/handler";
import { UserServiceCreate } from "../user/user.service";
import { UserCreateBody } from "../user/user.types";
import {
  AuthServiceLogin,
  AuthServiceLoginProps,
  AuthServiceReceivePassword,
  AuthServiceReceivePasswordProps,
} from "./auth.service";

export const AuthControllerLogin = ({
  body,
}: HandlerProps<unknown, AuthServiceLoginProps>) => AuthServiceLogin(body);

export const AuthControllerReceivePassword = ({
  body,
}: HandlerProps<unknown, AuthServiceReceivePasswordProps>) =>
  AuthServiceReceivePassword(body);

export const AuthControllerCreateUser = ({
  body,
}: HandlerProps<unknown, UserCreateBody>) => UserServiceCreate(body);

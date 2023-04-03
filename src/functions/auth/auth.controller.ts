import { HandlerProps } from "../../library/handler";
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

import {
  AuthServiceLogin,
  AuthServiceLoginProps,
  AuthServiceReceivePassword,
  AuthServiceReceivePasswordProps,
} from "./auth.service";

export type AuthControllerLoginRequest = {
  body: AuthServiceLoginProps;
};
export const AuthControllerLogin = ({ body }: AuthControllerLoginRequest) =>
  AuthServiceLogin(body);

export type AuthControllerReceivePasswordRequest = {
  body: AuthServiceReceivePasswordProps;
};
export const AuthControllerReceivePassword = ({
  body,
}: AuthControllerReceivePasswordRequest) => AuthServiceReceivePassword(body);

import {
  AuthServiceLogin,
  AuthServiceReceivePassword,
  AuthServiceReceivePasswordProps,
} from "./auth.service";

export type AuthControllerLoginRequest = {
  body: AuthControllerLoginBody;
};
export interface AuthControllerLoginBody {
  identification: string;
  password: string;
}

export interface AuthControllerLoginResponse {
  token: string;
}

export const AuthControllerLogin = ({
  body,
}: AuthControllerLoginRequest): Promise<AuthControllerLoginResponse> =>
  AuthServiceLogin(body);

export type AuthControllerReceivePasswordRequest = {
  body: AuthServiceReceivePasswordProps;
};

export const AuthControllerReceivePassword = ({
  body,
}: AuthControllerReceivePasswordRequest) => AuthServiceReceivePassword(body);

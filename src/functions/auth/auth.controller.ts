import { z } from "zod";
import { AuthServiceLogin, AuthServiceReceivePassword } from "./auth.service";

export type AuthControllerLoginRequest = {
  body: AuthControllerLoginBody;
};

export const AuthControllerLoginSchema = z.object({
  identification: z.string(),
  password: z.string(),
});

export type AuthControllerLoginBody = z.infer<typeof AuthControllerLoginSchema>;

export interface AuthControllerLoginResponse {
  token: string;
}

export const AuthControllerLogin = ({
  body,
}: AuthControllerLoginRequest): Promise<AuthControllerLoginResponse> => {
  const validatedBody = AuthControllerLoginSchema.parse(body);
  return AuthServiceLogin(validatedBody);
};

export type AuthControllerReceivePasswordRequest = {
  body: AuthControllerReceivePasswordBody;
};

export const AuthControllerReceivePasswordSchema = z.object({
  phone: z.string().refine((str) => /^\d{8}$/.test(str), {
    message: "Invalid phone number format",
  }),
});

export type AuthControllerReceivePasswordBody = z.infer<
  typeof AuthControllerReceivePasswordSchema
>;

export const AuthControllerReceivePassword = ({
  body,
}: AuthControllerReceivePasswordRequest) => {
  const validatedBody = AuthControllerReceivePasswordSchema.parse(body);
  return AuthServiceReceivePassword(validatedBody);
};

export enum AuthRole {
  owner = 1,
  admin = 3,
  user = 99,
}

export const AuthRoleValues = Object.values(AuthRole).filter(
  (value) => typeof value === "number"
);

export const AuthRoleKeys = Object.keys(AuthRole).filter((key) =>
  isNaN(Number(key))
);

export interface Auth {
  _id: string;
  password: string;
  email: string;
  phone: string;
  role: AuthRole;
  group: string;
  userId: string;
}

export interface AuthSession {
  authId: string;
  userId: string;
  role: number;
  group: string;
  iat?: number;
  exp?: number;
  isOwner: boolean;
  isAdmin: boolean;
  isUser: boolean;
}

export interface AuthLoginBodyRequest {
  identification: string;
  password: string;
}

export interface AuthLoginResponse {
  token: string;
}

export interface AuthCreateBodyRequest {
  email: string;
  phone: string;
  role: AuthRole;
  group: string;
  userId: string;
}

export type AuthCreateResponse = Auth;

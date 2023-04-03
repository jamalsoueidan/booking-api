import { z } from "zod";

export const UserSchema = z.object({
  _id: z.string(),
  fullname: z.string(),
  email: z.string(),
  phone: z.string(),
  active: z.boolean().default(true),
  avatar: z.string(),
  position: z.string(),
  postal: z.number(),
  address: z.string(),
  group: z.string().default("all"),
  language: z.string().default("da"),
  timeZone: z.string().default("Europe/Copenhagen"),
});

export type User = z.infer<typeof UserSchema>;

export const UserUpdateBodySchema = UserSchema.omit({
  _id: true,
});

export type UserUpdateBody = Partial<z.infer<typeof UserUpdateBodySchema>>;

export const UserCreateBodySchema = UserUpdateBodySchema;

export type UserCreateBody = z.infer<typeof UserCreateBodySchema>;

export interface UserReceivePasswordBodyRequest {
  phone: string;
}

export interface UserReceivePasswordResponse {
  message: string;
}

export interface UserSettingsResponse {
  language: string;
  timeZone: string;
}

export interface UserSettingsUpdateBodyRequest
  extends Omit<UserSettingsResponse, "_id"> {}
export interface UserServiceGetUserIdsbyGroupProps {
  group: string;
}

export type UserServiceGetAllUsersProps = {
  group?: string;
};

export interface UserServiceGetUserByIdQuery {
  _id: string;
  group?: string;
}

export interface UserServiceUpdateQuery {
  _id: string;
}

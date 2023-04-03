import { z } from "zod";
import { UserModel } from "../user/user.model";
import {
  UserServiceFindByIdAndUpdate,
  UserServiceGetById,
} from "../user/user.service";
import { UserUpdateBody, UserUpdateBodySchema } from "../user/user.types";

export const MyServiceGetSettingsSchema = z.object({
  userId: z.string(),
});

export type MyServiceGetSettingsQuery = z.infer<
  typeof MyServiceGetSettingsSchema
>;

export const MyServiceGetSettings = (query: MyServiceGetSettingsQuery) => {
  const { userId: id } = MyServiceGetSettingsSchema.parse(query);
  const user = UserModel.findById(id, "_id language timeZone");
  if (!user) {
    throw new Error("user with this id does not exist");
  }
  return user;
};

export const MyServiceUpdateSettingsQuerySchema = z.object({
  userId: z.string(),
});

export type MyServiceUpdateSettingsQuery = z.infer<
  typeof MyServiceUpdateSettingsQuerySchema
>;

export const MyServiceUpdateSettingsBodySchema = z.object({
  timeZone: z.string(),
  language: z.string(),
});

export type MyServiceUpdateSettingsBody = z.infer<
  typeof MyServiceUpdateSettingsBodySchema
>;

export const MyServiceUpdateSettings = async (
  query: MyServiceUpdateSettingsQuery,
  body: MyServiceUpdateSettingsBody
) => {
  MyServiceUpdateSettingsQuerySchema.parse(query);
  MyServiceUpdateSettingsBodySchema.parse(query);
  return UserModel.findByIdAndUpdate({ _id: query.userId }, body, {
    new: true,
    fields: "_id language timeZone",
  });
};

export const MyServiceGetAccountSchema = z.object({
  userId: z.string(),
});

export type MyServiceGetAccountQuery = z.infer<
  typeof MyServiceGetAccountSchema
>;

export const MyServiceGetAccount = (query: MyServiceGetAccountQuery) => {
  const { userId } = MyServiceGetAccountSchema.parse(query);
  return UserServiceGetById({ _id: userId });
};

export const MyServiceUpdateAccountQuerySchema = z.object({
  userId: z.string(),
});

export type MyServiceUpdateAccountQuery = z.infer<
  typeof MyServiceUpdateAccountQuerySchema
>;

export const MyServiceUpdateAccountBodySchema = UserUpdateBodySchema;
export type MyServiceUpdateAccountBody = UserUpdateBody;

export const MyServiceUpdateAccount = (
  query: MyServiceUpdateAccountQuery,
  body: MyServiceUpdateAccountBody
) => {
  const { userId } = MyServiceUpdateAccountQuerySchema.parse(query);
  const newBody = MyServiceUpdateAccountBodySchema.parse(body);
  return UserServiceFindByIdAndUpdate(userId, newBody);
};

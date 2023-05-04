import { z } from "zod";
import { _ } from "~/library/handler";

import { UserServiceGet } from "../user.service";
import { UserZodSchema } from "../user.types";

export const UserServiceGetUserByIdSchema = UserZodSchema.pick({
  customerId: true,
});

export type UserServiceGetUserByIdQuery = z.infer<
  typeof UserServiceGetUserByIdSchema
>;

export type UserControllerGetRequest = {
  query: UserServiceGetUserByIdQuery;
};

export type UserControllerGetResponse = Awaited<
  ReturnType<typeof UserServiceGet>
>;

export const UserControllerGet = _(
  async ({ query }: UserControllerGetRequest) => {
    const validateData = UserServiceGetUserByIdSchema.parse(query);
    return UserServiceGet(validateData);
  }
);

import { z } from "zod";
import { _ } from "~/library/handler";

import { UserServiceGet } from "../user.service";
import { UserZodSchema } from "../user.types";

export type UserControllerGetRequest = {
  query: z.infer<typeof UserServiceGetUserByIdSchema>;
};

export const UserServiceGetUserByIdSchema = UserZodSchema.pick({
  username: true,
});

export type UserControllerGetResponse = Awaited<
  ReturnType<typeof UserServiceGet>
>;

export const UserControllerGet = _(
  async ({ query }: UserControllerGetRequest) => {
    const validateData = UserServiceGetUserByIdSchema.parse(query);
    return UserServiceGet(validateData);
  }
);

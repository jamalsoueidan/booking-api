import { z } from "zod";
import { SessionKey, _ } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import { UserServiceGetById } from "../user.service";
import { User, UserSchema } from "../user.types";

export const UserServiceGetUserByIdSchema = UserSchema.pick({
  _id: true,
  group: true,
}).partial({ group: true });

export type UserServiceGetUserByIdQuery = z.infer<
  typeof UserServiceGetUserByIdSchema
>;

export type UserControllerGetByIdRequest = {
  query: UserServiceGetUserByIdQuery;
};

export type UserControllerGetByIdResponse = User;

export const UserControllerGetById = _(
  jwtVerify,
  async ({
    query,
    session,
  }: SessionKey<UserControllerGetByIdRequest>): Promise<UserControllerGetByIdResponse> => {
    if (session.isAdmin || session.isUser) {
      // only allow view user in same group
      query.group = session.group;
    }

    const validateData = UserServiceGetUserByIdSchema.parse(query);
    return UserServiceGetById(validateData);
  }
);

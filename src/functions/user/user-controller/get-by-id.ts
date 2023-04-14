import { z } from "zod";
import { SessionKey, _ } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import { UserServiceGetById } from "../user.service";
import { User, UserZodSchema } from "../user.types";

export const UserServiceGetUserByIdSchema = UserZodSchema.pick({
  _id: true,
});

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
    const validateData = UserServiceGetUserByIdSchema.parse(query);

    if (session.isAdmin || session.isUser) {
      return UserServiceGetById({ ...validateData, group: session.group });
    }

    return UserServiceGetById(validateData);
  }
);

import { z } from "zod";
import { SessionKey, _, onlyAdmin } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import { UserServiceCreate } from "../user.service";
import { User, UserSchema } from "../user.types";

export type UserControllerCreateUserRequest = {
  body: UserControllerCreateUserBody;
};

export type UserControllerCreateUserResponse = User;

export const UserControllerCreateUserSchema = UserSchema.omit({
  _id: true,
});

export type UserControllerCreateUserBody = z.infer<
  typeof UserControllerCreateUserSchema
>;

export const UserControllerCreateUser = _(
  jwtVerify,
  onlyAdmin,
  ({ body, session }: SessionKey<UserControllerCreateUserRequest>) => {
    const validateBody = UserControllerCreateUserSchema.parse(body);

    if (session.isAdmin && body.group !== session.group) {
      throw new Error("not allowed to create user in another group");
    }

    return UserServiceCreate(validateBody);
  }
);

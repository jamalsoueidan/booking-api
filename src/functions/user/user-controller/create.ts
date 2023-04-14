import { z } from "zod";
import { SessionKey, UnauthorizedError, _, onlyAdmin } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import { UserServiceCreate } from "../user.service";
import { User, UserZodSchema } from "../user.types";

export type UserControllerCreateUserRequest = {
  body: UserControllerCreateUserBody;
};

export type UserControllerCreateUserResponse = User;

export const UserControllerCreateUserSchema = UserZodSchema.omit({
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
      throw new UnauthorizedError(
        "not allowed to create user in another group"
      );
    }

    return UserServiceCreate(validateBody);
  }
);

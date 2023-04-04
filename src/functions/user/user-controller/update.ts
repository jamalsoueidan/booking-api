import { z } from "zod";
import { SessionKey, _, onlyAdmin } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import { UserServiceFindByIdAndUpdate } from "../user.service";
import { User, UserSchema } from "../user.types";

export type UserControllerUpdateRequest = {
  query: UserControllerUpdateQuery;
  body: UserControllerUpdateBody;
};

export const UserUpdateBodySchema = UserSchema.omit({
  _id: true,
});

export type UserControllerUpdateBody = Partial<
  z.infer<typeof UserUpdateBodySchema>
>;

export type UserControllerUpdateQuery = Pick<User, "_id">;

export const UserControllerUpdate = _(
  jwtVerify,
  onlyAdmin,
  ({ query, body, session }: SessionKey<UserControllerUpdateRequest>) => {
    if (session.isAdmin) {
      body.group = session.group;
    }
    return UserServiceFindByIdAndUpdate(query._id, body);
  }
);

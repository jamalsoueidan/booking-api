import { SessionKey, _, onlyAdmin } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import { UserServiceFindByIdAndUpdate } from "../user.service";
import { User, UserSchema } from "../user.types";

export type UserControllerUpdateRequest = {
  query: UserControllerUpdateQuery;
  body: UserControllerUpdateBody;
};

export type UserControllerUpdateResponse = User;

export type UserControllerUpdateBody = Partial<User>;

export const UserControllerUpdateSchema = UserSchema.pick({
  _id: true,
});
export type UserControllerUpdateQuery = Pick<User, "_id">;

export const UserControllerUpdate = _(
  jwtVerify,
  onlyAdmin,
  ({ query, body, session }: SessionKey<UserControllerUpdateRequest>) => {
    const validateQueryData = UserControllerUpdateSchema.parse(query);
    if (session.isAdmin) {
      return UserServiceFindByIdAndUpdate(
        { ...validateQueryData, group: session.group },
        {
          ...body,
          group: session.group,
        }
      );
    }
    return UserServiceFindByIdAndUpdate(validateQueryData, body);
  }
);

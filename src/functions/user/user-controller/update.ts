import { SessionKey, _, onlyAdmin } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import { UserServiceFindByIdAndUpdate } from "../user.service";
import { User, UserZodSchema } from "../user.types";

export type UserControllerUpdateRequest = {
  query: UserControllerUpdateQuery;
  body: UserControllerUpdateBody;
};

export type UserControllerUpdateResponse = User;

export const UserControllerUpdateBodySchema = UserZodSchema.omit({
  _id: true,
});

export type UserControllerUpdateBody = Partial<User>;

export const UserControllerUpdateQuerySchema = UserZodSchema.pick({
  _id: true,
});

export type UserControllerUpdateQuery = Pick<User, "_id">;

export const UserControllerUpdate = _(
  jwtVerify,
  onlyAdmin,
  ({ query, body, session }: SessionKey<UserControllerUpdateRequest>) => {
    const validateQuery = UserControllerUpdateQuerySchema.parse(query);
    const validateBody = UserControllerUpdateBodySchema.parse(body);
    if (session.isAdmin) {
      return UserServiceFindByIdAndUpdate(
        { ...validateQuery, group: session.group },
        {
          ...validateBody,
          group: session.group,
        }
      );
    }
    return UserServiceFindByIdAndUpdate(validateQuery, validateBody);
  }
);

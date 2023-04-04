import { SessionKey, _ } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import { UserServiceFindAll } from "../user.service";
import { User } from "../user.types";

export type UserControllerGetAllUsersRequest = {};

export type UserControllerGetAllUsersResponse = Array<User>;

export const UserControllerGetAllUsers = _(
  jwtVerify,
  ({ session }: SessionKey<UserControllerGetAllUsersRequest>) => {
    if (!session.isOwner) {
      return UserServiceFindAll({ group: session.group });
    }
    return UserServiceFindAll();
  }
);

import { HandlerProps, _, onlyAdmin } from "../../library/handler";
import { jwtVerify } from "../../library/jwt";
import { AuthServiceCreate } from "../auth/auth.service";
import { AuthRole } from "../auth/auth.types";
import {
  UserServiceCreate,
  UserServiceFindAll,
  UserServiceFindByIdAndUpdate,
  UserServiceGetById,
} from "./user.service";
import {
  UserCreateBody,
  UserServiceGetAllUsersProps,
  UserServiceGetUserByIdQuery,
  UserServiceUpdateQuery,
  UserUpdateBody,
} from "./user.types";

export const UserControllerGetAllUsers = _(
  jwtVerify,
  ({ query, session }: HandlerProps<UserServiceGetAllUsersProps, never>) => {
    if (!session.isOwner) {
      query.group = session.group;
    }
    return UserServiceFindAll(query);
  }
);

export const UserControllerCreateUser = _(
  jwtVerify,
  onlyAdmin,
  ({ body, session }: HandlerProps<never, UserCreateBody>) => {
    if (session.isAdmin && body.group !== session.group) {
      throw new Error("not allowed to create user in another group");
    }
    return UserServiceCreate(body);
  }
);

export const UserControllerCreateUserApi = _(
  async ({ body }: HandlerProps<unknown, UserCreateBody>) => {
    const user = await UserServiceCreate(body);
    // figure out how to move this out so user doesn't know anything about auth service
    await AuthServiceCreate({
      ...body,
      userId: user._id,
      role: AuthRole.owner,
    });
    return user;
  }
);

export const UserControllerGetById = _(
  jwtVerify,
  async ({ query, session }: HandlerProps<UserServiceGetUserByIdQuery>) => {
    if (session.isAdmin || session.isUser) {
      // only allow view user in same group
      query.group = session.group;
    }
    UserServiceGetById(query);
  }
);

export const UserControllerUpdate = _(
  jwtVerify,
  onlyAdmin,
  ({
    query,
    body,
    session,
  }: HandlerProps<UserServiceUpdateQuery, UserUpdateBody>) => {
    if (session.isAdmin) {
      body.group = session.group;
    }
    return UserServiceFindByIdAndUpdate(query._id, body);
  }
);

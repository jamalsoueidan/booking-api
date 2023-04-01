import { HandlerProps } from "../../library/handler";
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

export const UserControllerGetAllUsers = ({
  query,
  session,
}: HandlerProps<UserServiceGetAllUsersProps, never>) => {
  if (!session.isOwner) {
    query.group = session.group;
  }
  return UserServiceFindAll(query);
};

export const UserControllerCreate = ({
  body,
}: HandlerProps<never, UserCreateBody>) => UserServiceCreate(body);

export const UserControllerGetById = async ({
  query,
}: HandlerProps<UserServiceGetUserByIdQuery>) => UserServiceGetById(query);

export const UserControllerUpdate = ({
  body,
  query,
}: HandlerProps<UserServiceUpdateQuery, UserUpdateBody>) =>
  UserServiceFindByIdAndUpdate(query._id, body);

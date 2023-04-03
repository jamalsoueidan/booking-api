import { UserModel } from "./user.model";
import {
  UserCreateBody,
  UserCreateBodySchema,
  UserServiceGetUserByIdQuery,
  UserServiceGetUserIdsbyGroupProps,
  UserUpdateBody,
} from "./user.types";

export const UserServiceCreate = (body: UserCreateBody) => {
  const schema = UserCreateBodySchema.parse(body);
  return UserModel.create(schema);
};

export const UserServiceFindAll = (props: any = {}) => UserModel.find(props);

export const UserServiceFindByIdAndUpdate = (
  _id: string,
  body: UserUpdateBody
) =>
  UserModel.findByIdAndUpdate(_id, body, {
    new: true,
  });

export const UserServiceGetUserIdsbyGroup = async ({
  group,
}: UserServiceGetUserIdsbyGroupProps): Promise<Array<string>> => {
  const users = await UserModel.find({ group }, "");
  return users.map((user: any) => user.id);
};

export const UserServiceGetById = async (
  filter: UserServiceGetUserByIdQuery
) => {
  const user = await UserModel.findOne(filter);
  if (!user) {
    throw new Error("no user found");
  }
  return user;
};

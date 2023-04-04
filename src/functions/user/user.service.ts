import { UserModel } from "./user.model";
import { User } from "./user.types";

export const UserServiceCreate = (body: Omit<User, "_id">) =>
  UserModel.create(body);

export const UserServiceFindAll = (props: any = {}) => UserModel.find(props);

type UserServiceFindByIdAndUpdateQuery = Pick<User, "_id"> &
  Partial<Pick<User, "group">>;

export const UserServiceFindByIdAndUpdate = async (
  query: UserServiceFindByIdAndUpdateQuery,
  body: Partial<Omit<User, "_id">>
) => {
  const user = await UserModel.findOneAndUpdate(query, body, {
    new: true,
  });
  if (!user) {
    throw new Error("User not found");
  }
  // needs to update auth model (phone or email)
  return user;
};

export const UserServiceGetUserIdsbyGroup = async ({
  group,
}: {
  group: string;
}): Promise<Array<string>> => {
  const users = await UserModel.find({ group }, "");
  return users.map((user: any) => user.id);
};

type UserServiceGetByIdProps = {
  _id: string;
  group?: string;
};

export const UserServiceGetById = async (props: UserServiceGetByIdProps) => {
  const user = await UserModel.findOne(props);
  if (!user) {
    throw new Error("no user found");
  }
  return user;
};

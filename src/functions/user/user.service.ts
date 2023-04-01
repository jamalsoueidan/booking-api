import { compare } from "bcryptjs";
import { generate } from "generate-password";
import { UserModel } from "./user.model";
import { IUserDocument } from "./user.schema";
import {
  UserCreateBody,
  UserCreateBodySchema,
  UserServiceGetUserByIdQuery,
  UserServiceGetUserIdsbyGroupProps,
  UserServiceLoginProps,
  UserUpdateBody,
} from "./user.types";

export const UserServiceCreate = (body: UserCreateBody) => {
  const newUser = new UserModel(UserCreateBodySchema.parse(body));
  return newUser.save();
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

export const UserServiceCreateNewPassword = async (user: IUserDocument) => {
  const password = generate({
    length: 6,
    numbers: true,
    symbols: false,
    uppercase: false,
  });

  // eslint-disable-next-line no-param-reassign
  user.password = password;
  user.save();
  return password;
};

export const UserServiceLogin = async ({
  identification,
  password,
}: UserServiceLoginProps) => {
  const user = await UserModel.findOne({
    $or: [{ phone: identification }, { email: identification }],
    active: true,
  });

  if (user) {
    const correctPassword = await compare(password, user.password || "");
    if (correctPassword) {
      return user;
    }
  }
  return null;
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

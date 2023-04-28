import {
  UserControllerUpdateBody,
  UserServiceFindByIdAndUpdate,
  UserServiceGetById,
} from "../user";

type MyServiceGetAccountQuery = {
  _id: string;
};

export const MyServiceGetAccount = (query: MyServiceGetAccountQuery) => {
  return UserServiceGetById(query);
};

type MyServiceUpdateAccountQuery = {
  _id: string;
};

export type MyServiceUpdateAccountBody = UserControllerUpdateBody;

export const MyServiceUpdateAccount = (
  query: MyServiceUpdateAccountQuery,
  body: MyServiceUpdateAccountBody
) => {
  return UserServiceFindByIdAndUpdate(query, body);
};

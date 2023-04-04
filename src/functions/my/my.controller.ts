import { SessionKey, _ } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";

import { User } from "../user";
import {
  MyServiceGetAccount,
  MyServiceUpdateAccount,
  MyServiceUpdateAccountBody,
} from "./my.service";

export type MyControllerGetAccountResponse = User;

export const MyControllerGetAccount = _(
  jwtVerify,
  ({ session }: SessionKey<{}>) => MyServiceGetAccount({ _id: session.userId })
);

export type MyControllerUpdateAccountRequest = {
  body: MyControllerUpdateAccountBody;
};

export type MyControllerUpdateAccountResponse = User;
export type MyControllerUpdateAccountBody = MyServiceUpdateAccountBody;

export const MyControllerUpdateAccount = _(
  jwtVerify,
  ({ body, session }: SessionKey<MyControllerUpdateAccountRequest>) =>
    MyServiceUpdateAccount({ _id: session.userId }, body)
);

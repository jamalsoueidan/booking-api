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
  ({ session }: SessionKey<{}>) => {
    return MyServiceGetAccount({ _id: session.userId });
  }
);

export type MyControllerUpdateAccountRequest = {
  body: MyControllerUpdateAccountBody;
};

export type MyControllerUpdateAccountResponse = User;
export type MyControllerUpdateAccountBody = MyServiceUpdateAccountBody;

export const MyControllerUpdateAccount = _(
  jwtVerify,
  ({ body, session }: SessionKey<MyControllerUpdateAccountRequest>) => {
    //we need to validate my account, since we split the form in 2.
    // form with settings and language
    // form with the rest of the fields,
    // we need to handle this somehow
    // don't allow active to be updated from here!
    return MyServiceUpdateAccount({ _id: session.userId }, body);
  }
);

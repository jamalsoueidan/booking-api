import { HandlerProps } from "../../library/handler";
import { AuthSession } from "../auth/auth.types";
import {
  UserSettingsUpdateBodyRequest,
  UserUpdateBody,
} from "../user/user.types";
import {
  MyServiceGetAccount,
  MyServiceGetSettings,
  MyServiceUpdateAccount,
  MyServiceUpdateSettings,
} from "./my.service";

export const MyControllerGetSettings = ({
  session,
}: HandlerProps<never, never, AuthSession>) => MyServiceGetSettings(session);

export const MyControllerUpdateSettings = async ({
  body,
  session,
}: HandlerProps<never, UserSettingsUpdateBodyRequest, AuthSession>) =>
  MyServiceUpdateSettings(session, body);

export const MyControllerGetAccount = ({
  session,
}: HandlerProps<never, never, AuthSession>) => MyServiceGetAccount(session);

export const MyControllerUpdateAccount = ({
  body,
  session,
}: HandlerProps<never, UserUpdateBody, AuthSession>) =>
  MyServiceUpdateAccount(session, body);

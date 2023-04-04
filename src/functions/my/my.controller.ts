import {
  UserSettingsUpdateBodyRequest,
  UserUpdateBody,
} from "~/functions/user";
import { SessionKey } from "~/library/handler";
import {
  MyServiceGetAccount,
  MyServiceGetSettings,
  MyServiceUpdateAccount,
  MyServiceUpdateSettings,
} from "./my.service";

export const MyControllerGetSettings = ({ session }: SessionKey<{}>) =>
  MyServiceGetSettings(session);

export const MyControllerUpdateSettings = async ({
  body,
  session,
}: SessionKey<{ body: UserSettingsUpdateBodyRequest }>) =>
  MyServiceUpdateSettings(session, body);

export const MyControllerGetAccount = ({ session }: SessionKey<{}>) =>
  MyServiceGetAccount(session);

export const MyControllerUpdateAccount = ({
  body,
  session,
}: SessionKey<{ body: UserUpdateBody }>) =>
  MyServiceUpdateAccount(session, body);

import { StaffServiceCreate } from "@jamalsoueidan/backend.services.staff";
import {
  ControllerProps,
  ShopQuery,
  StaffBodyCreate,
} from "@jamalsoueidan/pkg.backend-types";
import {
  AuthServiceLogin,
  AuthServiceLoginProps,
  AuthServiceReceivePassword,
  AuthServiceReceivePasswordProps,
} from "../services/auth";

export const login = ({
  body,
}: ControllerProps<unknown, AuthServiceLoginProps>) => AuthServiceLogin(body);

export const passwordPhone = ({
  body,
}: ControllerProps<unknown, AuthServiceReceivePasswordProps>) =>
  AuthServiceReceivePassword(body);

export const createStaff = ({
  body,
}: ControllerProps<unknown, StaffBodyCreate & ShopQuery>) =>
  StaffServiceCreate(body);

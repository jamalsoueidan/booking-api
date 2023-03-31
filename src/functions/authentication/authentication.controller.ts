import { ControllerProps } from "@jamalsoueidan/pkg.backend-types";
import {
  StaffServiceLoginAndCreateToken,
  StaffServiceLoginAndCreateTokenProps,
  StaffServiceReceivePassword,
  StaffServiceReceivePasswordProps,
} from "../../services/staff";

export async function passwordPhone({
  body,
}: ControllerProps<unknown, StaffServiceReceivePasswordProps>) {
  return StaffServiceReceivePassword(body);
}

export async function login({
  body,
}: ControllerProps<unknown, StaffServiceLoginAndCreateTokenProps>) {
  return StaffServiceLoginAndCreateToken(body);
}

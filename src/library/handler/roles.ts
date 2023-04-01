import { StaffRole } from "@jamalsoueidan/backend.types.staff";
import { AuthSession } from "../../functions/auth/auth.types";
import { HandlerProps } from "../handler";

export const onlyAdmin = ({
  session,
}: HandlerProps<never, never, AuthSession>) => {
  if (session.role > StaffRole.admin) {
    throw new Error("not allowed");
  }
};

export const onlyOwner = ({
  session,
}: HandlerProps<never, never, AuthSession>) => {
  if (session.role > StaffRole.owner) {
    throw new Error("not allowed");
  }
};

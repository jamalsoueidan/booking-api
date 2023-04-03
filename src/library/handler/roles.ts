import { AuthSession } from "../../functions/auth/auth.types";
import { HandlerProps } from "../handler";
import { AuthRole } from "./../../functions/auth/auth.types";

export const onlyAdmin = ({
  session,
}: HandlerProps<never, never, AuthSession>) => {
  if (session.role > AuthRole.admin) {
    throw new Error("not allowed");
  }
};

export const onlyOwner = ({
  session,
}: HandlerProps<never, never, AuthSession>) => {
  if (session.role > AuthRole.owner) {
    throw new Error("not allowed");
  }
};

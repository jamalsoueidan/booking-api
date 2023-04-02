import { AuthSession } from "../../functions/auth/auth.types";
import { UserRole } from "../../functions/user/user.types";
import { HandlerProps } from "../handler";

export const onlyAdmin = ({
  session,
}: HandlerProps<never, never, AuthSession>) => {
  if (session.role > UserRole.admin) {
    throw new Error("not allowed");
  }
};

export const onlyOwner = ({
  session,
}: HandlerProps<never, never, AuthSession>) => {
  if (session.role > UserRole.owner) {
    throw new Error("not allowed");
  }
};

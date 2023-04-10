import { AuthRole } from "~/functions/auth";
import { ForbiddenError, SessionKey } from "../handler";

export const onlyAdmin = ({ session }: SessionKey<{}>) => {
  if (session.role > AuthRole.admin) {
    throw new ForbiddenError("not allowed");
  }
};

export const onlyOwner = ({ session }: SessionKey<{}>) => {
  if (session.role > AuthRole.owner) {
    throw new ForbiddenError("not allowed");
  }
};

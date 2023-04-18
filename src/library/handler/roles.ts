import { AuthRole } from "~/functions/auth";
import { ForbiddenError, SessionKey } from "../handler";

export const onlyAdmin = ({ session }: SessionKey<{}>) => {
  if (session.role > AuthRole.admin) {
    throw new ForbiddenError([
      { path: ["role"], message: "NOT_ALLOWED", code: "custom" },
    ]);
  }
};

export const onlyOwner = ({ session }: SessionKey<{}>) => {
  if (session.role > AuthRole.owner) {
    throw new ForbiddenError([
      { path: ["role"], message: "NOT_ALLOWED", code: "custom" },
    ]);
  }
};

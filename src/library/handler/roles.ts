import { AuthRole } from "~/functions/auth";
import { SessionKey } from "../handler";

export const onlyAdmin = ({ session }: SessionKey<{}>) => {
  if (session.role > AuthRole.admin) {
    throw new Error("not allowed");
  }
};

export const onlyOwner = ({ session }: SessionKey<{}>) => {
  if (session.role > AuthRole.owner) {
    throw new Error("not allowed");
  }
};

import { SessionKey, _, onlyAdmin } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import {
  ProductServiceGetAvailableUser,
  ProductServiceGetAvailableUsers,
} from "../product.service";

export type ProductControllerGetAvailableUsersRequest = {
  query: { group?: string };
};

export type ProductControllerGetAllResponse =
  Array<ProductServiceGetAvailableUser>;

export const ProductControllerGetAvailableUsers = _(
  jwtVerify,
  onlyAdmin,
  ({
    query,
    session,
  }: SessionKey<ProductControllerGetAvailableUsersRequest>) => {
    if (session.isAdmin) {
      query.group = session.group;
    }
    return ProductServiceGetAvailableUsers(query.group);
  }
);

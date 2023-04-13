import { SessionKey, _, onlyAdmin } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import {
  ProductServiceGetAvailableUser,
  ProductServiceGetAvailableUsers,
} from "../product.service";

export type ProductControllerGetAvailableUsersRequest = {
  query: { group?: string };
};

export type ProductControllerGetAvailableUsersResponse =
  ProductServiceGetAvailableUser[];

export const ProductControllerGetAvailableUsers = _(
  jwtVerify,
  onlyAdmin,
  async ({
    query,
    session,
  }: SessionKey<ProductControllerGetAvailableUsersRequest>) => {
    if (session.isAdmin) {
      query.group = session.group;
    }
    return ProductServiceGetAvailableUsers(query.group);
  }
);

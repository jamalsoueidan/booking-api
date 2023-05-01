import { SessionKey, _ } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import { ProductUsersServiceGetAll } from "../product-users.service";

export type ProductUsersControllerGetAllRequest = {
  query: Parameters<typeof ProductUsersServiceGetAll>[0];
};

export type ProductUsersControllerGetAllResponse = Awaited<
  ReturnType<typeof ProductUsersServiceGetAll>
>;

export const ProductUsersControllerGetAll = _(
  jwtVerify,
  ({ query, session }: SessionKey<ProductUsersControllerGetAllRequest>) => {
    if (!session.isOwner) {
      query.userId = session.userId;
    }
    return ProductUsersServiceGetAll(query);
  }
);

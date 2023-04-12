import { SessionKey, _ } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import { ProductServiceGetById } from "../product.service";
import { Product } from "../product.types";

export type ProductControllerGetByIdRequest = {
  query: { group?: string; id: string };
};

export type ProductControllerGetByIdResponse = Product;

export const ProductControllerGetById = _(
  jwtVerify,
  async ({ query, session }: SessionKey<ProductControllerGetByIdRequest>) => {
    if (!session.isOwner) {
      query.group = session.group;
    }
    return ProductServiceGetById(query);
  }
);

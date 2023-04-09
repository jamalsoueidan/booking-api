import { SessionKey, _ } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import {
  ProductServiceGetById,
  ProductServiceGetByIdProps,
} from "../product.service";
import { Product } from "../product.types";

export type ProductControllerGetByIdRequest = {
  query: ProductServiceGetByIdProps;
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

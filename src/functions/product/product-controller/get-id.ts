import { _ } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import { ProductServiceGetById } from "../product.service";
import { Product } from "../product.types";

export type ProductControllerGetByIdRequest = {
  query: { id: string };
};

export type ProductControllerGetByIdResponse = Product;

export const ProductControllerGetById = _(
  jwtVerify,
  async ({ query }: ProductControllerGetByIdRequest) => {
    return ProductServiceGetById(query);
  }
);

import { _ } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import {
  ProductServiceGetAll,
  ProductServiceGetAllProps,
} from "../product.service";
import { Product } from "../product.types";

export type ProductControllerGetAllRequest = {
  query?: ProductServiceGetAllProps;
};

export type ProductControllerGetAllResponse = Array<Product>;

export const ProductControllerGetAll = _(
  jwtVerify,
  ({ query }: ProductControllerGetAllRequest) => {
    return ProductServiceGetAll(query);
  }
);

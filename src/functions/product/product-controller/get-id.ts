import {
  ProductServiceGetById,
  ProductServiceGetByIdProps,
} from "../product.service";
import { Product } from "../product.types";

export type ProductControllerGetByIdRequest = {
  query: ProductServiceGetByIdProps;
};

export type ProductControllerGetByIdReturn = Product;

export const ProductControllerGetById = async ({
  query,
}: ProductControllerGetByIdRequest) => {
  return ProductServiceGetById(query);
};

import { z } from "zod";
import { ProductServiceUpdate } from "../product.service";
import { Product, ProductServiceUpdateBodyZodSchema } from "../product.types";

export type ProductControllerUpdateRequest = {
  query: { id: string };
  body: z.infer<typeof ProductServiceUpdateBodyZodSchema>;
};

export type ProductControllerGetAllResponse = Product;

export const ProductControllerUpdate = ({
  query,
  body,
}: ProductControllerUpdateRequest) => {
  const validateBody = ProductServiceUpdateBodyZodSchema.parse(body);
  return ProductServiceUpdate(query.id, validateBody);
};

import { z } from "zod";
import { _ } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import { ProductServiceUpdate } from "../product.service";
import { Product, ProductServiceUpdateBodyZodSchema } from "../product.types";

export type ProductControllerUpdateRequest = {
  query: { id: string };
  body: z.infer<typeof ProductServiceUpdateBodyZodSchema>;
};

export type ProductControllerGetAllResponse = Product;

export const ProductControllerUpdate = _(
  jwtVerify,
  ({ query, body }: ProductControllerUpdateRequest) => {
    const validateBody = ProductServiceUpdateBodyZodSchema.parse(body);
    return ProductServiceUpdate(query.id, validateBody);
  }
);

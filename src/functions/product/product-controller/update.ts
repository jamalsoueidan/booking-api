import { z } from "zod";
import { _, onlyOwner } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import {
  ProductServiceGetById,
  ProductServiceUpdate,
} from "../product.service";
import { ProductServiceUpdateBodyZodSchema } from "../product.types";

export type ProductControllerUpdateRequest = {
  query: { id: string };
  body: z.infer<typeof ProductServiceUpdateBodyZodSchema>;
};

export type ProductControllerUpdateResponse = Awaited<
  ReturnType<typeof ProductServiceGetById>
>;

export const ProductControllerUpdate = _(
  jwtVerify,
  onlyOwner,
  async ({ query, body }: ProductControllerUpdateRequest) => {
    const validateBody = ProductServiceUpdateBodyZodSchema.parse(body);
    await ProductServiceUpdate(query.id, validateBody);
    return ProductServiceGetById(query);
  }
);

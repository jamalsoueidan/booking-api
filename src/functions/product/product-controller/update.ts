import { z } from "zod";
import { SessionKey, _, onlyAdmin } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import {
  ProductServiceGetById,
  ProductServiceUpdate,
  ProductServiceUpdateReturn,
} from "../product.service";
import { ProductServiceUpdateBodyZodSchema } from "../product.types";

export type ProductControllerUpdateRequest = {
  query: { id: string; group?: string };
  body: z.infer<typeof ProductServiceUpdateBodyZodSchema>;
};

export type ProductControllerUpdateResponse = ProductServiceUpdateReturn;

export const ProductControllerUpdate = _(
  jwtVerify,
  onlyAdmin,
  async ({
    query,
    body,
    session,
  }: SessionKey<ProductControllerUpdateRequest>) => {
    if (session.isAdmin) {
      query.group = session.group;
      if (body.users?.length > 0) {
        // get all users in the product
        const product = await ProductServiceGetById({ id: query.id });
        if (product) {
          // take all users not belong in the same group
          const users = product.users.filter(
            ({ group }) => group !== session.group
          );

          if (users?.length > 0) {
            const outsideGroupStaff = users?.map((s) => ({
              userId: s._id.toString(),
              tag: s.tag,
            }));

            body.users = [...outsideGroupStaff, ...body.users];
          }
        }
      }
    }

    const validateBody = ProductServiceUpdateBodyZodSchema.parse(body);
    await ProductServiceUpdate(query.id, validateBody);
    return ProductServiceGetById(query);
  }
);

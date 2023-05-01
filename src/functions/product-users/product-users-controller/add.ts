import { z } from "zod";
import { SessionKey, _ } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import { ProductUsersServiceAdd } from "../product-users.service";
import { ProductUsersZodSchema } from "../product-users.types";

export type ProductUsersControllerAddRequest = {
  body: z.infer<typeof ProductUsersServiceAddBodySchema>;
};

export const ProductUsersServiceAddBodySchema = ProductUsersZodSchema.omit({
  _id: true,
});

export type ProductUsersControllerAddResponse = Awaited<
  ReturnType<typeof ProductUsersServiceAdd>
>;

/*
make sure he only adding his own userId
*/
export const ProductUsersControllerAdd = _(
  jwtVerify,
  async ({ body, session }: SessionKey<ProductUsersControllerAddRequest>) => {
    if (!session.isOwner) {
      body.userId = session.userId;
    }

    const validateBody = ProductUsersServiceAddBodySchema.parse(body);
    return ProductUsersServiceAdd(validateBody);
  }
);

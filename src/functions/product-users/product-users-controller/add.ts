import { z } from "zod";
import { _ } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import { ProductUsersServiceAdd } from "../product-users.service";
import { ProductUsersZodSchema } from "../product-users.types";

export type ProductUsersControllerAddRequest = {
  body: z.infer<typeof ProductUsersServiceAddBodySchema>;
};

export const ProductUsersServiceAddBodySchema = ProductUsersZodSchema.omit({
  _id: true,
  pid: true,
});

export type ProductUsersControllerAddResponse = ReturnType<
  typeof ProductUsersServiceAdd
>;

/*
make sure he only adding his own userId
*/
export const ProductUsersControllerAdd = _(
  jwtVerify,
  async ({ body }: ProductUsersControllerAddRequest) => {
    const validateBody = ProductUsersServiceAddBodySchema.parse(body);
    return ProductUsersServiceAdd(validateBody);
  }
);

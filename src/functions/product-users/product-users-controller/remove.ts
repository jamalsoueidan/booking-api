import { SessionKey, _ } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import { ProductUsersServiceRemove } from "../product-users.service";
import { ProductUsersZodSchema } from "../product-users.types";

export type ProductUsersControllerRemoveRequest = {
  query: Parameters<typeof ProductUsersServiceRemove>[0];
};

export const ProductUsersServiceRemoveSchema = ProductUsersZodSchema.pick({
  productId: true,
  userId: true,
});

export type ProductUsersControllerRemoveResponse = Awaited<
  ReturnType<typeof ProductUsersServiceRemove>
>;

export const ProductUsersControllerRemove = _(
  jwtVerify,
  async ({
    query,
    session,
  }: SessionKey<ProductUsersControllerRemoveRequest>) => {
    if (!session.isOwner) {
      query.userId = session.userId;
    }

    const validateQuery = ProductUsersServiceRemoveSchema.parse(query);
    return ProductUsersServiceRemove(validateQuery);
  }
);

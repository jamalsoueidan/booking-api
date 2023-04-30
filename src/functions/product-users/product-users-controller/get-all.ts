import { _ } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";

export type ProductControllerGetAllResponse = Awaited<
  ReturnType<typeof ProductServiceGetAll>
>;

export const ProductControllerGetAll = _(jwtVerify, () => {
  return ProductServiceGetAll();
});

import { z } from "zod";
import { ProductModel } from "../product/product.model";
import { ProductUsersModel } from "./product-users.model";
import { ProductUsers, ProductUsersZodSchema } from "./product-users.types";

export type ProductUsersServiceGetAllProps = z.infer<
  typeof ProductUsersServiceGetAllSchema
>;

export const ProductUsersServiceGetAllSchema = ProductUsersZodSchema.pick({
  userId: true,
});

export const ProductUsersServiceGetAll = ({
  userId,
}: ProductUsersServiceGetAllProps) => {
  return ProductUsersModel.find({ userId }).populate("userId");
};

export type ProductUsersServiceAddBody = Pick<
  ProductUsers,
  "userId" | "productId" | "tag"
>;

export const ProductUsersServiceAdd = async (
  body: ProductUsersServiceAddBody
) => {
  const product = await ProductModel.findOne({
    _id: body.productId,
  }).orFail(new Error("No docs found!"));
  return ProductUsersModel.create({ ...body, pid: product.pid });
};

export const ProductUsersServiceRemoveSchema = ProductUsersZodSchema.omit({
  productId: true,
  userId: true,
});

export type ProductUsersServiceRemoveProps = z.infer<
  typeof ProductUsersServiceRemoveSchema
>;

export const ProductUsersServiceRemove = async (
  props: ProductUsersServiceRemoveProps
) => {
  ProductUsersServiceRemoveSchema.parse(props);
  return ProductModel.deleteOne(props);
};

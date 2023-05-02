import { ObjectId } from "mongoose";
import { ProductUsersModel } from "~/functions/product-users/product-users.model";
import { Product } from "~/functions/product/product.types";
import { Tag } from "~/functions/shift";
import { createProduct } from "./product";
import { createUser } from "./user";

export const createProductAndCreateUser = async ({
  productId,
}: Pick<Product, "productId">) => {
  const product = await createProduct({ productId });
  const user = await createUser();
  await ProductUsersModel.create({
    productId,
    userId: user._id,
    tag: Tag.end_of_week,
  });
  return { product, user };
};

export const createProductAndAddUser = async ({
  productId,
  userId,
}: Pick<Product, "productId"> & { userId: ObjectId }) => {
  const product = await createProduct({ productId });
  await ProductUsersModel.create({
    productId,
    userId,
    tag: Tag.end_of_week,
  });
  return { product };
};

export const addUserToProduct = async ({
  productId,
  userId,
}: Pick<Product, "productId"> & { userId: ObjectId }) => {
  return ProductUsersModel.create({
    productId,
    userId,
    tag: Tag.end_of_week,
  });
};

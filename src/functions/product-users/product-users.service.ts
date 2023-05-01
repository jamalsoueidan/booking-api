import mongoose from "mongoose";
import { Product, ProductModel } from "~/functions/product";
import { User } from "~/functions/user";
import { BadError } from "~/library/handler";
import { ProductUsersModel } from "./product-users.model";
import { ProductUsers } from "./product-users.types";

export type ProductUsersServiceGetAllProps = Pick<ProductUsers, "userId"> &
  Partial<Pick<ProductUsers, "productId">>;

export type ProductUsersServiceGetAllReturn = ProductUsers & {
  product: Product;
  user: User;
};

export const ProductUsersServiceGetAll = async ({
  userId,
  productId,
}: ProductUsersServiceGetAllProps) => {
  return ProductUsersModel.aggregate<ProductUsersServiceGetAllReturn>([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        ...(productId ? { productId } : {}),
      },
    },
    {
      $lookup: {
        from: "Product",
        as: "product",
        let: { productId: "$productId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$productId", "$$productId"] },
                  { $eq: ["$active", true] },
                ],
              },
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: "$product",
      },
    },
    {
      $lookup: {
        from: "User",
        as: "user",
        localField: "userId",
        foreignField: "_id",
      },
    },
    {
      $unwind: {
        path: "$user",
      },
    },
  ]);
};

export type ProductUsersServiceAddBody = Pick<
  ProductUsers,
  "userId" | "productId" | "tag"
>;

export const ProductUsersServiceAdd = async (
  body: ProductUsersServiceAddBody
) => {
  // should not allow user to add to inactive product?
  await ProductModel.findOne({
    productId: body.productId,
  }).orFail(new Error("No docs found!"));

  await ProductUsersModel.create(body);
  const productUsers = await ProductUsersServiceGetAll(body);
  if (!productUsers) {
    throw new BadError([
      { code: "custom", message: "ERROR_d", path: ["userId"] },
    ]);
  }
  return productUsers[0];
};

export type ProductUsersServiceRemoveProps = Pick<
  ProductUsers,
  "userId" | "productId"
>;

export const ProductUsersServiceRemove = async (
  props: ProductUsersServiceRemoveProps
) => {
  return ProductUsersModel.deleteOne(props);
};

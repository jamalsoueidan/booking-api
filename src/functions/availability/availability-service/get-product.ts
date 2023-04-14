import mongoose, { PipelineStage } from "mongoose";
import { Product, ProductModel } from "~/functions/product";

export type AvailabilitySericeGetProductProps = {
  productId: number;
  userId?: string;
};

export const AvailabilityServiceGetProduct = async ({
  productId,
  userId,
}: AvailabilitySericeGetProductProps) => {
  const pipeline: PipelineStage[] = [
    {
      $match: {
        active: true,
        productId,
      },
    },
    {
      $unwind: "$users",
    },
  ];

  if (userId) {
    pipeline.push({
      $match: {
        "users.userId": new mongoose.Types.ObjectId(userId),
      },
    });
  }

  pipeline.push({
    $group: {
      _id: "$_id",
      users: { $push: "$users" },
    },
  });

  const products = await ProductModel.aggregate<Product>(pipeline);

  return products.length === 0 ? null : products[0];
};

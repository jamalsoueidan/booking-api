import mongoose, { PipelineStage } from "mongoose";
import { ProductUsersModel } from "~/functions/product-users/product-users.model";
import { AvailabilityUser } from "../availability.types";

export type AvailabilityServiceGetUsersProps = {
  productId: number;
  userId?: string;
  group?: string;
};

export const AvailabilityServiceGetUsers = ({
  productId,
  userId,
  group,
}: AvailabilityServiceGetUsersProps) => {
  let pipeline: PipelineStage[] = [
    {
      $match: {
        productId,
        ...(userId ? { userId: new mongoose.Types.ObjectId(userId) } : null),
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
        let: { userId: "$userId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$_id", "$$userId"] },
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
        path: "$user",
      },
    },
  ];

  if (group) {
    pipeline.push({
      $match: {
        "user.group": group,
      },
    });
  }

  return ProductUsersModel.aggregate<AvailabilityUser>(pipeline);
};

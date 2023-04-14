import mongoose, { PipelineStage } from "mongoose";
import { ProductModel } from "~/functions/product";
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

  pipeline = [
    ...pipeline,
    {
      $lookup: {
        as: "users.user",
        foreignField: "_id",
        from: "User",
        localField: "users.userId",
      },
    },
    {
      $unwind: {
        path: "$users.user",
      },
    },
    {
      $addFields: {
        "users.user.userId": "$users.user._id",
        "users.user.tag": "$users.tag",
      },
    },
    {
      $addFields: {
        "_id.users": "$users.user",
      },
    },
    {
      $replaceRoot: {
        newRoot: "$_id",
      },
    },
    {
      $replaceRoot: {
        newRoot: "$users",
      },
    },
    { $match: { active: true } },
    {
      $project: {
        __v: 0,
        active: 0,
        email: 0,
        phone: 0,
        shop: 0,
      },
    },
  ];

  if (group) {
    pipeline.push({
      $match: {
        group,
      },
    });
  }

  return ProductModel.aggregate<AvailabilityUser>(pipeline);
};

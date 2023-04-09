import mongoose, { PipelineStage } from "mongoose";

export const createProductPipeline = (group?: string, userId?: string) => {
  const pipeline: PipelineStage[] = [
    {
      $unwind: { path: "$users", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        as: "users.userId",
        foreignField: "_id",
        from: "User",
        localField: "users.userId",
      },
    },
    {
      $unwind: {
        path: "$users.userId",
      },
    },
    {
      $addFields: {
        "users.userId.userId": "$users.userId._id",
        "users.userId.tag": "$users.tag",
      },
    },
    {
      $addFields: {
        users: "$users.userId",
      },
    },
    { $sort: { "users.fullname": 1 } },
  ];

  if (userId) {
    pipeline.push({
      $match: {
        "users._id": new mongoose.Types.ObjectId(userId),
      },
    });
  }

  if (group) {
    pipeline.push({
      $match: {
        "users.group": group,
      },
    });
  }

  pipeline.push(
    {
      $group: {
        _id: "$_id",
        product: { $first: "$$ROOT" },
        users: { $push: "$users" },
      },
    },
    {
      $addFields: {
        "product.users": "$users",
      },
    },
    { $replaceRoot: { newRoot: "$product" } }
  );

  return pipeline;
};

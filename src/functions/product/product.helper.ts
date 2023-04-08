import mongoose, { PipelineStage } from "mongoose";

export const createProductPipeline = (group?: string, userId?: string) => {
  const pipeline: PipelineStage[] = [
    {
      $unwind: { path: "$user", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        as: "user.userId",
        foreignField: "_id",
        from: "User",
        localField: "user.user",
      },
    },
    {
      $unwind: {
        path: "$user.user",
      },
    },
    {
      $addFields: {
        "user.user.tag": "$user.tag",
      },
    },
    {
      $addFields: {
        user: "$user.user",
      },
    },
    { $sort: { "user.fullname": 1 } },
  ];

  if (userId) {
    pipeline.push({
      $match: {
        "user._id": new mongoose.Types.ObjectId(userId),
      },
    });
  }

  if (group) {
    pipeline.push({
      $match: {
        "user.group": group,
      },
    });
  }

  pipeline.push(
    {
      $group: {
        _id: "$_id",
        product: { $first: "$$ROOT" },
        user: { $push: "$user" },
      },
    },
    {
      $addFields: {
        "product.user": "$user",
      },
    },
    { $replaceRoot: { newRoot: "$product" } }
  );

  return pipeline;
};

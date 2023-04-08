import { startOfToday } from "date-fns";
import mongoose, { PipelineStage } from "mongoose";
import { ShiftModel, Tag } from "../shift";
import { User } from "../user";
import { createProductPipeline } from "./product.helper";
import { ProductModel } from "./product.model";
import { Product } from "./product.types";

type ProductServiceGetAllProps = {
  group?: string;
  userId?: string;
};

export const ProductServiceGetAll = async ({
  userId,
  group,
}: ProductServiceGetAllProps) => {
  return ProductModel.aggregate(createProductPipeline(group, userId));
};

type ProductServiceGetByIdProps = {
  group?: string;
  id: string;
};

export const ProductServiceGetById = async ({
  id,
  group,
}: ProductServiceGetByIdProps) => {
  const product = await ProductModel.findOne({
    _id: new mongoose.Types.ObjectId(id),
    "user.0": { $exists: false }, // if product contains zero user, then just return the product, no need for aggreation
  });

  if (product) {
    return product;
  }

  const pipeline = createProductPipeline(group);
  pipeline.unshift({ $match: { _id: new mongoose.Types.ObjectId(id) } });

  const products = await ProductModel.aggregate<Product>(pipeline);
  return products.length > 0 ? products[0] : null;
};

type ProductServiceUpdateQueryProps = {
  id: string;
};

type ProductServiceUpdateBodyStaffProperty = {
  userId: string;
  tag: Tag;
};

type ProductServiceUpdateBodyProps = Partial<
  Pick<Product, "duration" | "buffertime" | "active">
> & {
  users?: ProductServiceUpdateBodyStaffProperty[];
};

type ProductServiceUpdateReturn = {
  acknowledged: boolean;
  modifiedCount: number;
  upsertedCount: number;
  matchedCount: number;
};

export const ProductServiceUpdate = async (
  query: ProductServiceUpdateQueryProps,
  body: ProductServiceUpdateBodyProps
): Promise<ProductServiceUpdateReturn> => {
  const { users, ...properties } = body;

  const newStaffier =
    users?.map((s) => ({
      userId: s.userId,
      tag: s.tag,
    })) || [];

  // turn active ON=true first time customer add user to product
  const product = await ProductModel.findById(
    new mongoose.Types.ObjectId(query.id)
  ).lean();

  let { active } = properties;
  if (product?.users.length === 0 && newStaffier.length > 0) {
    active = true;
  }
  if (newStaffier.length === 0) {
    active = false;
  }

  return ProductModel.updateOne(
    {
      _id: new mongoose.Types.ObjectId(query.id),
    },
    {
      $set: { ...properties, active, users: newStaffier },
    },
    {
      new: true,
    }
  );
};

type ProductServiceGetAvailableStaffReturn = User & {
  tags: Tag[];
};

type ProductServiceGetAvailableStaffProps = {
  group?: string;
};

// @description return all user that don't belong yet to the product
export const ProductServiceGetAvailableUser = ({
  group,
}: ProductServiceGetAvailableStaffProps = {}) => {
  const pipeline: PipelineStage[] = [
    {
      $match: {
        start: {
          $gte: startOfToday(),
        },
      },
    },
    {
      $group: {
        _id: {
          userId: "$userId",
          tag: "$tag",
        },
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ userId: "$_id.userId", tag: "$_id.tag" }],
        },
      },
    },
    {
      $group: {
        _id: "$userId",
        tags: { $push: "$tag" },
      },
    },
    {
      $project: {
        _id: "$_id",
        tags: "$tags",
      },
    },
    {
      $lookup: {
        as: "users",
        foreignField: "_id",
        from: "User",
        localField: "_id",
      },
    },
    {
      $unwind: "$users", // explode array
    },
    {
      $addFields: {
        "users.tags": "$tags",
      },
    },
    {
      $replaceRoot: {
        newRoot: "$users",
      },
    },
    { $sort: { fullname: 1 } },
  ];

  if (group) {
    pipeline.push({
      $match: {
        group,
      },
    });
  }

  return ShiftModel.aggregate<ProductServiceGetAvailableStaffReturn>(pipeline);
};

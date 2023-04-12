import { startOfToday } from "date-fns";
import mongoose, { PipelineStage } from "mongoose";
import { z } from "zod";
import { ShiftModel, Tag } from "../shift";
import { User } from "../user";
import { createProductPipeline } from "./product.helper";
import { ProductModel } from "./product.model";
import { Product, ProductServiceUpdateBodyZodSchema } from "./product.types";

export type ProductServiceGetAllProps = {
  group?: string;
  userId?: string;
};

export type ProductServiceGetAllProduct = Omit<Product, "users"> & {
  users: Array<User & { userId: string; tag: Tag }>;
};

export type ProductServiceGetAllReturn = Array<ProductServiceGetAllProduct>;

export const ProductServiceGetAll = async ({
  userId,
  group,
}: ProductServiceGetAllProps = {}) => {
  return ProductModel.aggregate<ProductServiceGetAllProduct>(
    createProductPipeline(group, userId)
  );
};

export type ProductServiceGetByIdProps = {
  group?: string;
  id?: string;
  productId?: number;
};

export type ProductServiceGetByIdReturn = ProductServiceGetAllProduct;

export const ProductServiceGetById = async ({
  id,
  group,
  productId,
}: ProductServiceGetByIdProps) => {
  // if group is
  if (!group) {
    const product = await ProductModel.findOne({
      ...(id ? { _id: new mongoose.Types.ObjectId(id) } : null),
      ...(productId ? { productId } : null),
      "users.0": { $exists: false }, // if product contains zero staff, then just return the product, no need for aggreation
    });

    if (product) {
      return product.toJSON() as ProductServiceGetByIdReturn;
    }
  }

  const pipeline = createProductPipeline(group);
  if (id) {
    pipeline.unshift({ $match: { _id: new mongoose.Types.ObjectId(id) } });
  }
  if (productId) {
    pipeline.unshift({ $match: { productId } });
  }

  const products = await ProductModel.aggregate<ProductServiceGetByIdReturn>(
    pipeline
  );

  return products?.length > 0 ? products[0] : null;
};

export type ProductServiceUpdateReturn = ProductServiceGetByIdReturn;

export const ProductServiceUpdate = async (
  id: string,
  body: Partial<z.infer<typeof ProductServiceUpdateBodyZodSchema>>
) => {
  const { users, ...properties } = body;

  const newStaffier =
    users?.map((s) => ({
      userId: s.userId,
      tag: s.tag,
    })) || [];

  // turn active ON=true first time customer add user to product
  const product = await ProductModel.findById(
    new mongoose.Types.ObjectId(id)
  ).lean();

  let { active } = properties;
  if (product?.users.length === 0 && newStaffier.length > 0) {
    active = true;
  }
  if (newStaffier.length === 0) {
    active = false;
  }

  return ProductModel.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(id),
    },
    {
      $set: { ...properties, active, users: newStaffier },
    },
    {
      new: true,
    }
  );
};

export type ProductServiceGetAvailableUser = User & {
  tags: Tag[];
};

// @description return all user that don't belong yet to the product
export const ProductServiceGetAvailableUsers = (group?: string) => {
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

  return ShiftModel.aggregate<ProductServiceGetAvailableUser>(pipeline);
};

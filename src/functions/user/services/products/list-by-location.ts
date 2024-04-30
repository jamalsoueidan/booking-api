import mongoose, { PipelineStage } from "mongoose";
import { Schedule, ScheduleModel } from "~/functions/schedule";
import { NotFoundError } from "~/library/handler";
import { StringOrObjectIdType } from "~/library/zod";
import { UserModel } from "../../user.model";

export type UserProductsServiceListProductsByLocationReturn = Pick<
  Schedule,
  "products"
>;

export type UserProductsServiceListProductsByLocationProps = {
  username: string;
  productHandle: string | string[];
  locationId: StringOrObjectIdType;
};

export const UserProductsServiceListProductsByLocation = async ({
  username,
  productHandle,
  locationId,
}: UserProductsServiceListProductsByLocationProps) => {
  const schedulesPipeline: PipelineStage[] = [
    {
      $lookup: {
        from: UserModel.collection.name,
        localField: "customerId",
        foreignField: "customerId",
        as: "customer",
      },
    },
    {
      $unwind: "$customer",
    },
    {
      $match: {
        "customer.username": username,
      },
    },
    {
      $lookup: {
        from: ScheduleModel.collection.name,
        localField: "customer.customerId",
        foreignField: "customerId",
        as: "scheduleInfo",
      },
    },
  ];

  if (!Array.isArray(productHandle)) {
    schedulesPipeline.push(
      {
        $match: {
          "products.productHandle": productHandle,
        },
      },
      {
        $unwind: "$products",
      }
    );
  }

  if (Array.isArray(productHandle)) {
    schedulesPipeline.push(
      {
        $unwind: "$products",
      },
      {
        $match: {
          "products.productHandle": { $in: productHandle },
        },
      }
    );
  }

  schedulesPipeline.push(
    {
      $match: {
        "products.locations.location": new mongoose.Types.ObjectId(locationId),
      },
    },
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        products: { $push: "$products" },
      },
    },
    {
      $project: {
        scheduleId: "$_id",
        scheduleName: "$name",
        products: 1,
      },
    }
  );

  const schedules =
    await ScheduleModel.aggregate<UserProductsServiceListProductsByLocationReturn>(
      schedulesPipeline
    );

  if (schedules.length === 0) {
    throw new NotFoundError([
      {
        path: ["username", "productHandle", "locationId"],
        message: "NOT_FOUND",
        code: "custom",
      },
    ]);
  }

  return schedules[0].products;
};

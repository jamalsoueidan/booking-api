import mongoose, { PipelineStage } from "mongoose";
import { Schedule, ScheduleModel } from "~/functions/schedule";
import { NotFoundError } from "~/library/handler";
import { StringOrObjectId } from "~/library/zod";

export type UserProductsServiceListProductsByLocationReturn = Pick<
  Schedule,
  "products"
>;

export type UserProductsServiceListProductsByLocationProps = {
  username: string;
  productId: number | number[];
  locationId: StringOrObjectId;
};

export const UserProductsServiceListProductsByLocation = async ({
  username,
  productId,
  locationId,
}: UserProductsServiceListProductsByLocationProps) => {
  const schedulesPipeline: PipelineStage[] = [
    {
      $lookup: {
        from: "User", // The name of the customer collection
        localField: "customerId", // Field in the current documents
        foreignField: "customerId", // Field in the customer documents to match on
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
        from: "schedules", // The name of the schedule collection
        localField: "customer.customerId",
        foreignField: "customerId",
        as: "scheduleInfo",
      },
    },
  ];

  if (!Array.isArray(productId)) {
    schedulesPipeline.push(
      {
        $match: {
          "products.productId": productId,
        },
      },
      {
        $unwind: "$products",
      }
    );
  }

  if (Array.isArray(productId)) {
    schedulesPipeline.push(
      {
        $unwind: "$products",
      },
      {
        $match: {
          "products.productId": { $in: productId },
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
        path: ["username", "productId", "locationId"],
        message: "NOT_FOUND",
        code: "custom",
      },
    ]);
  }

  return schedules[0].products;
};

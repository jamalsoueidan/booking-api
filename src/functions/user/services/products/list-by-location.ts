import { Schedule, ScheduleModel } from "~/functions/schedule";
import { NotFoundError } from "~/library/handler";
import { StringOrObjectId } from "~/library/zod";

export type UserProductsServiceListProductsByLocationReturn = Pick<
  Schedule,
  "products"
>;

export type UserProductsServiceListProductsByLocationProps = {
  username: string;
  productId?: number;
  locationId?: StringOrObjectId;
};

export const UserProductsServiceListProductsByLocation = async ({
  username,
  productId,
  locationId,
}: UserProductsServiceListProductsByLocationProps) => {
  const schedules =
    await ScheduleModel.aggregate<UserProductsServiceListProductsByLocationReturn>(
      [
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
        {
          $match: {
            "products.productId": productId,
          },
        },
        {
          $unwind: "$products",
        },
        {
          $match: {
            "products.locations.location": locationId,
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
        },
      ]
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

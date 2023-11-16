import mongoose from "mongoose";
import { ILocationDocument, Location } from "~/functions/location";
import { Schedule, ScheduleModel, ScheduleProduct } from "~/functions/schedule";
import { UserServiceGetCustomerId } from "~/functions/user";
import { NotFoundError } from "~/library/handler";

export type UserScheduleServiceGetByLocationProps = {
  username: string;
  scheduleId: Schedule["_id"];
  locationId: ILocationDocument["_id"];
};

export type UserScheduleServiceGetByLocationReponse = Omit<
  Schedule,
  "products"
> & {
  locations: Array<Pick<ILocationDocument, "_id"> & Location>;
  products: Array<
    Omit<ScheduleProduct, "locations"> & {
      locations: Array<Pick<ILocationDocument, "_id"> & Location>;
    }
  >;
};

export const UserScheduleServiceGetByLocation = async ({
  scheduleId,
  username,
  locationId,
}: UserScheduleServiceGetByLocationProps) => {
  const { customerId } = await UserServiceGetCustomerId({ username });

  const pipeline = [
    {
      $match: {
        _id: new mongoose.Types.ObjectId(scheduleId),
        customerId: customerId,
      },
    },
    { $unwind: "$products" },
    { $unwind: "$products.locations" },
    {
      $lookup: {
        from: "Location",
        localField: "products.locations.location",
        foreignField: "_id",
        as: "products.locations",
      },
    },
    { $unwind: "$products.locations" },
    {
      $group: {
        _id: {
          scheduleId: "$_id",
          customerId: "$customerId",
          productId: "$products.productId",
          variantId: "$products.variantId",
        },
        locations: { $addToSet: "$products.locations" },
        productDetail: { $first: "$products" },
        name: { $first: "$name" },
        slots: { $first: "$slots" },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
      },
    },
    {
      $addFields: {
        "productDetail.locations": "$locations",
      },
    },
    {
      $group: {
        _id: "$_id.scheduleId",
        customerId: { $first: "$_id.customerId" },
        name: { $first: "$name" },
        slots: { $first: "$slots" },
        locations: { $addToSet: "$locations" },
        products: { $addToSet: "$productDetail" },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
      },
    },
    {
      $addFields: {
        locations: {
          $reduce: {
            input: "$locations",
            initialValue: [],
            in: { $concatArrays: ["$$value", "$$this"] },
          },
        },
      },
    },
    {
      $project: {
        name: 1,
        slots: 1,
        customerId: 1,
        createdAt: 1,
        updatedAt: 1,
        locations: 1,
        products: {
          $filter: {
            input: "$products",
            as: "product",
            cond: {
              $in: [
                new mongoose.Types.ObjectId(locationId),
                "$$product.locations._id",
              ],
            },
          },
        },
      },
    },
  ];

  const schedules =
    await ScheduleModel.aggregate<UserScheduleServiceGetByLocationReponse>(
      pipeline
    );
  if (schedules.length === 0) {
    throw new NotFoundError([
      {
        path: ["customerId", "scheduleId", "locationId"],
        message: "NOT_FOUND",
        code: "custom",
      },
    ]);
  }

  const schedule = schedules[0];
  return {
    ...schedule,
    locations: schedule.locations
      .filter(
        (location, index, self) =>
          index ===
          self.findIndex((l) => l._id.toString() == location._id.toString())
      )
      .sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
        return 0;
      }),
  };
};

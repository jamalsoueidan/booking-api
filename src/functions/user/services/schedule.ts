import mongoose, { PipelineStage } from "mongoose";
import { Location } from "~/functions/location";
import { Schedule, ScheduleModel } from "~/functions/schedule";
import { User, UserServiceGet } from "~/functions/user";
import { NotFoundError } from "~/library/handler";

export type UserScheduleServiceLocationsListProps = Pick<User, "customerId">;

export type UserScheduleServiceLocationsListReponse = Omit<
  Schedule,
  "products"
> & {
  locations: Array<Location>;
};

export const UserScheduleServiceLocationsList = async ({
  customerId,
}: UserScheduleServiceLocationsListProps) => {
  const pipeline: PipelineStage[] = [
    { $match: { customerId, products: { $exists: true, $ne: [] } } },
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
        name: { $first: "$name" },
        slots: { $first: "$slots" },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
      },
    },
    {
      $group: {
        _id: "$_id.scheduleId",
        customerId: { $first: "$_id.customerId" },
        name: { $first: "$name" },
        slots: { $first: "$slots" },
        locations: { $addToSet: "$locations" },
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
  ];

  let schedules =
    await ScheduleModel.aggregate<UserScheduleServiceLocationsListReponse>(
      pipeline
    ).exec();

  return schedules.map((schedule) => ({
    ...schedule,
    locations: schedule.locations.filter(
      (location, index, self) =>
        index ===
        self.findIndex((l) => l._id.toString() == location._id.toString())
    ),
  }));
};

export type UserScheduleServiceGetProps = {
  username: string;
  scheduleId: Schedule["_id"];
  locationId: Location["_id"];
};

export const UserScheduleServiceGet = async ({
  scheduleId,
  username,
  locationId,
}: UserScheduleServiceGetProps) => {
  const { customerId } = await UserServiceGet({ username });
  const pipeline = [
    {
      $match: {
        _id: new mongoose.Types.ObjectId(scheduleId),
        customerId: customerId,
      },
    },
    {
      $project: {
        name: 1,
        slots: 1,
        customerId: 1,
        createdAt: 1,
        updatedAt: 1,
        products: {
          $filter: {
            input: "$products",
            as: "product",
            cond: {
              $in: [
                new mongoose.Types.ObjectId(locationId),
                "$$product.locations.location",
              ],
            },
          },
        },
      },
    },
  ];

  const schedule = await ScheduleModel.aggregate<Schedule>(pipeline);
  if (schedule.length === 0) {
    throw new NotFoundError([
      {
        path: ["customerId", "scheduleId", "locationId"],
        message: "NOT_FOUND",
        code: "custom",
      },
    ]);
  }

  return schedule[0];
};

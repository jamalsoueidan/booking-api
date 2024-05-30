import { PipelineStage } from "mongoose";
import { ILocationDocument, Location } from "~/functions/location";
import { Schedule, ScheduleModel } from "~/functions/schedule";
import { User } from "~/functions/user";

export type UserScheduleServiceLocationsListProps = Pick<User, "customerId">;

export type UserScheduleServiceLocationsListReponse = Omit<
  Schedule,
  "products"
> & {
  locations: Array<Location & Pick<ILocationDocument, "_id">>;
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
        metafieldId: { $first: "$metafieldId" },
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
        metafieldId: { $first: "$metafieldId" },
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

  return schedules
    .map((schedule) => ({
      ...schedule,
      locations: schedule.locations.filter(
        (location, index, self) =>
          index ===
          self.findIndex((l) => l._id.toString() == location._id.toString())
      ),
    }))
    .sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    });
};

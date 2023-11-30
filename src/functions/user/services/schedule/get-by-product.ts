import { Location } from "~/functions/location";
import { Schedule, ScheduleModel, ScheduleProduct } from "~/functions/schedule";
import { NotFoundError } from "~/library/handler";

export type UesrScheduleAggreateReturnValue = Pick<
  Schedule,
  "_id" | "customerId" | "name"
> & { product: ScheduleProduct } & { locations: Array<Location> };

export type UserScheduleServiceGetByProductIdProps = {
  customerId: number;
  productHandle: string;
};

export async function UserScheduleServiceGetByProductId({
  customerId,
  productHandle,
}: UserScheduleServiceGetByProductIdProps) {
  // first just the schedule with the product
  const schedule = await ScheduleModel.findOne({
    customerId,
    "products.productHandle": productHandle,
  }).orFail(
    new NotFoundError([
      {
        path: ["customerId", "productHandle"],
        message: "NOT_FOUND",
        code: "custom",
      },
    ])
  );

  const schedules =
    await ScheduleModel.aggregate<UesrScheduleAggreateReturnValue>([
      {
        $match: {
          _id: schedule._id,
          customerId,
        },
      },
      {
        $unwind: "$products",
      },
      {
        $match: {
          "products.productHandle": productHandle,
        },
      },
      {
        $unwind: "$products.locations",
      },
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
        $sort: {
          "products.locations.name": 1,
        },
      },
      {
        $group: {
          _id: "$_id",
          locations: {
            $addToSet: "$products.locations",
          },
          product: { $first: "$products" },
          name: { $first: "$name" },
          slots: { $first: "$slots" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
        },
      },
    ]);

  if (schedules.length === 0) {
    throw new NotFoundError([
      {
        path: ["customerId", "scheduleId", "locationId"],
        message: "NOT_FOUND",
        code: "custom",
      },
    ]);
  }

  return {
    ...schedules[0],
    locations: schedules[0].locations.sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    }),
  };
}

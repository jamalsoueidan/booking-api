import { Schedule, ScheduleModel, ScheduleProduct } from "~/functions/schedule";
import { NotFoundError } from "~/library/handler";

export type UesrScheduleAggreateReturnValue = Pick<
  Schedule,
  "_id" | "customerId" | "name"
> & { product: ScheduleProduct } & { locations: Array<Location> };

export type UserScheduleServiceGetByProductIdProps = {
  customerId: number;
  productId: number;
};

export async function UserScheduleServiceGetByProductId({
  customerId,
  productId,
}: UserScheduleServiceGetByProductIdProps) {
  // first just the schedule with the product
  const schedule = await ScheduleModel.findOne({
    customerId,
    "products.productId": productId,
  }).orFail(
    new NotFoundError([
      {
        path: ["customerId", "productId"],
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
          "products.productId": productId,
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

  return schedules[0];
}

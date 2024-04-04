import { ScheduleModel } from "~/functions/schedule";
import { UserModel } from "../../../user.model";

export const UserServiceFilterProducts = async ({
  profession,
}: {
  profession: string;
}) => {
  return UserModel.aggregate<{
    productHandle: string;
    productId: string;
    count: string;
  }>([
    { $match: { professions: profession } },
    {
      $lookup: {
        from: ScheduleModel.collection.name,
        localField: "customerId",
        foreignField: "customerId",
        as: "schedules",
      },
    },
    { $unwind: "$schedules" },
    { $unwind: "$schedules.products" },
    {
      $group: {
        _id: {
          productHandle: "$schedules.products.productHandle",
          productId: "$schedules.products.productId",
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        productHandle: "$_id.productHandle",
        productId: "$_id.productId",
        count: "$count",
      },
    },
  ]);
};

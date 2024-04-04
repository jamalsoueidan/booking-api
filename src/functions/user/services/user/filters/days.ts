import { ScheduleModel } from "~/functions/schedule";
import { UserModel } from "../../../user.model";

export const UserServiceFilterDays = async ({
  profession,
}: {
  profession: string;
}) => {
  return UserModel.aggregate([
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
    { $unwind: "$schedules.slots" },
    {
      $group: {
        _id: "$schedules.slots.day",
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        day: "$_id",
        count: "$count",
      },
    },
  ]);
};

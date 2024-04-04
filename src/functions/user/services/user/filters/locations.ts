import { LocationModel, LocationTypes } from "~/functions/location";
import { UserModel } from "../../../user.model";

export const UserServiceFilterLocations = async ({
  profession,
}: {
  profession: string;
}) => {
  return UserModel.aggregate<{
    city: string;
    locationType: LocationTypes;
    count: number;
  }>([
    { $match: { professions: profession } },
    {
      $lookup: {
        from: LocationModel.collection.name,
        localField: "customerId",
        foreignField: "customerId",
        as: "locations",
      },
    },
    { $unwind: "$locations" },
    {
      $group: {
        _id: {
          city: "$locations.city",
          locationType: "$locations.locationType",
        },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        city: "$_id.city",
        locationType: "$_id.locationType",
        count: "$count",
      },
    },
  ]);
};

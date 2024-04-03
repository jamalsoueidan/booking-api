import { LocationModel } from "~/functions/location";
import { UserModel } from "../../../user.model";

export const UserServiceFilterLocations = async ({
  profession,
}: {
  profession: string;
}) => {
  const result = await UserModel.aggregate([
    { $match: { professions: profession } },
    {
      $lookup: {
        from: LocationModel.collection.name,
        localField: "customerId",
        foreignField: "customerId",
        as: "locations",
      },
    },
    {
      $unwind: "$locations",
    },
    {
      $group: {
        _id: "$locations.city",
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: null,
        keys: {
          $push: { k: "$_id", v: "$count" },
        },
      },
    },
    {
      $replaceRoot: {
        newRoot: { $arrayToObject: "$keys" },
      },
    },
  ]);

  return result[0];
};

import { UserModel } from "../../../user.model";

export const UserServiceFiltersSpecialties = async ({
  profession,
}: {
  profession: string;
}) => {
  const result = await UserModel.aggregate([
    { $match: { professions: profession } },
    { $unwind: "$professions" },
    { $match: { professions: profession } },
    { $unwind: "$specialties" },
    {
      $group: {
        _id: "$specialties",
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: null,
        cities: {
          $push: { k: "$_id", v: "$count" },
        },
      },
    },
    {
      $replaceRoot: {
        newRoot: { $arrayToObject: "$cities" },
      },
    },
  ]);

  return result[0];
};

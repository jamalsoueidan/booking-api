import { UserModel } from "../../../user.model";

export const UserServiceFiltersSpecialties = async ({
  profession,
}: {
  profession: string;
}) => {
  return UserModel.aggregate<{ speciality: string; count: number }>([
    { $match: { professions: profession } },
    { $unwind: "$specialties" },
    {
      $group: {
        _id: "$specialties",
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        speciality: "$_id",
        count: "$count",
      },
    },
  ]);
};

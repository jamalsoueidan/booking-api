import { UserModel } from "../../user.model";

export const UserServiceProfessions = async () => {
  return UserModel.aggregate<{ profession: string; count: number }>([
    { $match: { active: true, isBusiness: true } },
    { $unwind: "$professions" },
    {
      $group: {
        _id: "$professions",
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        profession: "$_id",
        count: "$count",
      },
    },
  ]);
};

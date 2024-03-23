import { UserModel } from "../../user.model";

export const UserServiceProfessions = async () => {
  const professionCount = await UserModel.aggregate([
    { $unwind: "$professions" },
    {
      $group: {
        _id: "$professions",
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const professions: Record<string, number> = {};
  for (const profession of professionCount) {
    professions[profession._id] = profession.count;
  }

  return professions;
};

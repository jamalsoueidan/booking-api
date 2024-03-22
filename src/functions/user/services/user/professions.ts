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
  ]);

  const professionCountFormatted: Record<string, number> = {};
  for (const profession of professionCount) {
    professionCountFormatted[profession._id] = profession.count;
  }

  return professionCountFormatted;
};

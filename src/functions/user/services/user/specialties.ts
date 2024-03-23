import { UserModel } from "../../user.model";

export const UserServiceSpecialties = async ({
  profession,
}: {
  profession: string;
}) => {
  const professionCount = await UserModel.aggregate([
    { $unwind: "$professions" },
    { $match: { professions: profession } },
    { $unwind: "$specialties" },
    {
      $group: {
        _id: "$specialties",
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

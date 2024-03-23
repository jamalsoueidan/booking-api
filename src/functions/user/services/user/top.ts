import { UserModel } from "../../user.model";
import { UserServiceProfessions } from "./professions";

export const UserServiceTop = async ({
  limit = 5,
  page = 1,
}: {
  limit?: number;
  page?: number;
}) => {
  const professions = await UserServiceProfessions();

  const professionsArray = Object.entries(professions).map(([name, count]) => ({
    name,
    count,
  }));

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedProfessions = professionsArray.slice(startIndex, endIndex);

  return UserModel.aggregate([
    {
      $match: { professions: { $in: paginatedProfessions.map((p) => p.name) } },
    },
    { $unwind: "$professions" },
    {
      $match: { professions: { $in: paginatedProfessions.map((p) => p.name) } },
    },
    {
      $project: {
        customerId: 1,
        username: 1,
        shortDescription: 1,
        fullname: 1,
        professions: 1,
        images: 1,
      },
    },
    {
      $group: {
        _id: "$professions",
        users: { $push: "$$ROOT" },
        totalUsers: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        profession: "$_id",
        users: { $slice: ["$users", 5] },
        totalUsers: 1,
      },
    },
    { $sort: { profession: 1 } },
  ]);
};

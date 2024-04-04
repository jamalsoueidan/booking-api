import { User } from "~/functions/user/user.types";
import { UserModel } from "../../../user.model";

export const UserServiceFilterSearch = async ({
  search,
}: {
  search: string;
}) => {
  return UserModel.aggregate<
    Pick<User, "_id" | "images" | "username" | "fullname" | "shortDescription">
  >([
    {
      $match: {
        active: true,
        isBusiness: true,
        $or: [
          { username: { $regex: search, $options: "i" } },
          { fullname: { $regex: search, $options: "i" } },
        ],
      },
    },
    { $limit: 6 },
    {
      $project: {
        _id: 1,
        images: 1,
        username: 1,
        fullname: 1,
        shortDescription: 1,
      },
    },
  ]);
};

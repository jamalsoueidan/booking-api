import { ScheduleModel } from "~/functions/schedule";
import { User } from "../../user/user.types";

export type ProductsServiceGetUsersReturn = {
  productId: number;
  totalUsers: number;
  users: Array<Pick<User, "customerId" | "username" | "fullname" | "images">>;
};

export type ProductsServiceGetUsersProps = {
  productIds: number[];
};

export const UserProductsServiceGetUsers = async ({
  productIds,
}: ProductsServiceGetUsersProps): Promise<
  Array<ProductsServiceGetUsersReturn>
> => {
  const countPipeline = [
    {
      $match: {
        "products.productId": { $in: productIds },
      },
    },
    {
      $unwind: "$products",
    },
    {
      $match: {
        "products.productId": { $in: productIds },
      },
    },
    {
      $lookup: {
        from: "User",
        let: { customerId: "$customerId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$customerId", "$$customerId"] },
                  { $eq: ["$active", true] },
                ],
              },
            },
          },
          {
            $project: {
              customerId: 1,
            },
          },
        ],
        as: "userDetails",
      },
    },
    {
      $unwind: "$userDetails",
    },
    {
      $group: {
        _id: "$products.productId",
        totalUsers: { $sum: 1 },
      },
    },
  ];

  const usersPipeline = [
    {
      $match: {
        "products.productId": { $in: productIds },
      },
    },
    {
      $unwind: "$products",
    },
    {
      $match: {
        "products.productId": { $in: productIds },
      },
    },
    {
      $lookup: {
        from: "User",
        let: { customerId: "$customerId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$customerId", "$$customerId"] },
                  { $eq: ["$active", true] },
                  { $ifNull: ["$images.profile.url", false] },
                ],
              },
            },
          },
          {
            $project: {
              customerId: 1,
              username: 1,
              fullname: 1,
              "images.profile": "$images.profile",
            },
          },
        ],
        as: "userDetails",
      },
    },
    {
      $unwind: "$userDetails",
    },
    {
      $group: {
        _id: "$products.productId",
        users: { $push: "$userDetails" },
      },
    },
    {
      $project: {
        _id: 0,
        productId: "$_id",
        users: { $slice: ["$users", 5] },
      },
    },
  ];

  const countSchedule = await ScheduleModel.aggregate<{
    _id: number;
    totalUsers: number;
  }>(countPipeline);

  const usersSchedule = await ScheduleModel.aggregate<{
    productId: number;
    users: Array<Pick<User, "customerId" | "username" | "fullname" | "images">>;
  }>(usersPipeline);

  return countSchedule.map((p) => {
    const users = usersSchedule.find((u) => u.productId === p._id);

    return {
      productId: p._id,
      totalUsers: p.totalUsers,
      users: users?.users || [],
    };
  });
};

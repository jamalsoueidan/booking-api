import { PipelineStage } from "mongoose";
import { ScheduleModel } from "~/functions/schedule";
import { User } from "../../user/user.types";

type Users = Array<
  Pick<
    User,
    "customerId" | "username" | "fullname" | "images" | "shortDescription"
  > & {
    createdAt: Date;
  }
>;

export type ProductsServiceGetUsersByVariantReturn = {
  productId: number;
  variantId: number;
  totalUsers: number;
  result: Users;
  nextCursor?: Date;
};

export type ProductsServiceGetUsersByVariantProps = {
  productId: number;
  variantId: number;
  limit?: number;
  nextCursor?: Date | string;
};

export const UserProductsServiceGetUsersVariant = async ({
  productId,
  variantId,
  limit,
  nextCursor,
}: ProductsServiceGetUsersByVariantProps): Promise<ProductsServiceGetUsersByVariantReturn> => {
  const l = limit || 5;

  const countPipeline: PipelineStage[] = [
    {
      $match: {
        "products.productId": productId,
        "products.variantId": variantId,
      },
    },
    {
      $unwind: "$products",
    },
    {
      $match: {
        "products.productId": productId,
        "products.variantId": variantId,
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
                  { $eq: ["$isBusiness", true] },
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
        _id: {
          productId: "$products.productId",
          variantId: "$products.variantId",
        },
        totalUsers: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        productId: "$_id.productId",
        variantId: "$_id.variantId",
        totalUsers: "$totalUsers",
      },
    },
  ];

  const usersPipeline: PipelineStage[] = [
    {
      $match: {
        "products.productId": productId,
        "products.variantId": variantId,
      },
    },
    {
      $unwind: "$products",
    },
    {
      $match: {
        "products.productId": productId,
        "products.variantId": variantId,
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
                  { $eq: ["$isBusiness", true] },
                  { $ifNull: ["$images.profile.url", false] },
                ],
              },
            },
          },
          {
            $project: {
              customerId: 1,
              username: 1,
              createdAt: 1,
              fullname: 1,
              shortDescription: 1,
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
  ];

  if (nextCursor) {
    usersPipeline.push(
      {
        $match: {
          "userDetails.createdAt": { $gt: nextCursor },
        },
      },
      {
        $sort: {
          "userDetails.createdAt": 1,
        },
      }
    );
  }

  usersPipeline.push(
    {
      $skip: 0,
    },
    {
      $limit: l,
    },
    {
      $group: {
        _id: {
          productId: "$products.productId",
          variantId: "$products.variantId",
        },
        users: { $push: "$userDetails" },
      },
    },

    {
      $project: {
        _id: 0,
        productId: "$_id.productId",
        variantId: "$_id.variantId",
        users: "$users",
      },
    }
  );

  const countSchedule = await ScheduleModel.aggregate<{
    productId: number;
    variantId: number;
    totalUsers: number;
  }>(countPipeline);

  const usersSchedule = await ScheduleModel.aggregate<{
    productId: number;
    variantId: number;
    users: Users;
  }>(usersPipeline);

  if (countSchedule.length === 0 || usersSchedule.length === 0) {
    return {
      productId,
      variantId,
      totalUsers: 0,
      result: [],
      nextCursor: undefined,
    };
  }

  const users = usersSchedule[0].users;

  return {
    productId,
    variantId,
    totalUsers: countSchedule[0].totalUsers,
    result: users,
    nextCursor:
      users.length >= l ? users[users.length - 1].createdAt : undefined,
  };
};

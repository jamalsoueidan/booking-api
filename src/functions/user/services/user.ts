import { FilterQuery } from "mongoose";

import { NotFoundError } from "~/library/handler";
import { UserModel } from "../user.model";
import { IUserDocument } from "../user.schema";
import { User } from "../user.types";

export type UserServiceUsernameTakenProps = Required<Pick<User, "username">>;

export const UserServiceUsernameTaken = async ({
  username,
}: UserServiceUsernameTakenProps) => {
  const usernameTaken = await UserModel.findOne({ username }).lean();
  return { usernameTaken: !!usernameTaken };
};

export type UserServiceGetCustomerIdProps = Required<Pick<User, "username">>;

export const UserServiceGetCustomerId = ({ username }: UserServiceGetProps) => {
  return UserModel.findOne(
    { username, active: true, isBusiness: true },
    { customerId: 1 }
  )
    .lean()
    .orFail(
      new NotFoundError([
        {
          path: ["username"],
          message: "NOT_FOUND",
          code: "custom",
        },
      ])
    );
};

export type UserServiceGetProps = Required<Pick<User, "username">>;

export const UserServiceGet = ({ username }: UserServiceGetProps) => {
  return UserModel.findOne({ username, active: true, isBusiness: true })
    .lean()
    .orFail(
      new NotFoundError([
        {
          path: ["username"],
          message: "NOT_FOUND",
          code: "custom",
        },
      ])
    );
};

type UserServiceListProps = {
  nextCursor?: Date | string;
  limit?: number;
  profession?: string;
  sortOrder?: "asc" | "desc";
};

export const UserServiceList = async ({
  nextCursor,
  limit,
  profession,
  sortOrder = "desc",
}: UserServiceListProps = {}) => {
  let query: FilterQuery<IUserDocument> = { active: true, isBusiness: true };

  if (profession) {
    query = {
      ...query,
      professions: { $in: [profession] },
    };
  }

  const sortParam = sortOrder === "asc" ? 1 : -1; // 1 for 'asc', -1 for 'desc'

  if (nextCursor) {
    query = {
      ...query,
      createdAt: sortParam === 1 ? { $gt: nextCursor } : { $lt: nextCursor },
    };
  }

  const l = limit || 10;
  const users = await UserModel.find(query)
    .sort({ createdAt: sortParam })
    .limit(l);

  return {
    results: users,
    nextCursor:
      users.length >= l ? users[users.length - 1].createdAt : undefined,
  };
};

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

export const UserServiceFindCustomerOrFail = ({
  customerId,
}: {
  customerId: number;
}) => {
  return UserModel.findOne({
    customerId,
  }).orFail(
    new NotFoundError([
      {
        path: ["customerId"],
        message: "NOT_FOUND",
        code: "custom",
      },
    ])
  );
};

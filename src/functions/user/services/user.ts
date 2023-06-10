import { FilterQuery } from "mongoose";
import { NotFoundError } from "~/library/handler";
import { UserModel } from "../user.model";
import { IUserDocument } from "../user.schema";
import { User } from "../user.types";

export type UserServiceGetProps = Pick<User, "username">;

export const UserServiceGet = (props: UserServiceGetProps) => {
  return UserModel.findOne({ ...props, active: true, isBusiness: true })
    .lean()
    .orFail(
      new NotFoundError([
        {
          path: ["userId"],
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

  const users = await UserModel.find(query)
    .select("customerId createdAt")
    .sort({ createdAt: sortParam })
    .limit(limit || 10);

  return {
    results: users,
    nextCursor:
      users.length > 0 ? users[users.length - 1].createdAt : undefined,
  };
};

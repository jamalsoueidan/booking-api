import { FilterQuery } from "mongoose";
import { UserModel } from "../../user.model";
import { IUserDocument } from "../../user.schema";

export type UserServiceListProps = {
  nextCursor?: Date | string;
  limit?: number;
  profession?: string;
  specialties?: string[];
  sortOrder?: "asc" | "desc";
};

export const UserServiceList = async ({
  nextCursor,
  limit,
  profession,
  specialties,
  sortOrder = "desc",
}: UserServiceListProps = {}) => {
  let query: FilterQuery<IUserDocument> = { active: true, isBusiness: true };

  if (profession) {
    query = {
      ...query,
      professions: { $in: [profession] },
    };
  }

  // Filter by specialties, if provided
  if (specialties && specialties.length > 0) {
    query = { ...query, specialties: { $all: specialties } };
  }

  const sortParam = sortOrder === "asc" ? 1 : -1; // 1 for 'asc', -1 for 'desc'

  if (nextCursor) {
    query = {
      ...query,
      createdAt: sortParam === 1 ? { $gt: nextCursor } : { $lt: nextCursor },
    };
  }

  const totalCount = await UserModel.countDocuments(query);
  const l = limit || 10;
  const users = await UserModel.find(query)
    .sort({ createdAt: sortParam })
    .limit(l);

  return {
    results: users,
    nextCursor:
      users.length >= l ? users[users.length - 1].createdAt : undefined,
    total: totalCount,
  };
};

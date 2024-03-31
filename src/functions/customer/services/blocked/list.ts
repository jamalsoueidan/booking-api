import mongoose from "mongoose";
import { BlockedModel } from "~/functions/blocked/blocked.model";
import { Blocked } from "~/functions/blocked/blocked.types";
import { StringOrObjectId } from "~/library/zod";

export type CustomerBlockedServiceListProps = {
  customerId: number;
  limit?: number;
  nextCursor?: StringOrObjectId;
};

export type CustomerBlockedServiceListAggregate = {
  _id: string;
  start: Date;
  end: Date;
};

export const CustomerBlockedServiceList = async ({
  customerId,
  limit = 10,
  nextCursor,
}: CustomerBlockedServiceListProps) => {
  let cursorCondition = nextCursor
    ? { _id: { $gt: new mongoose.Types.ObjectId(nextCursor) } }
    : {};

  const matchStage = {
    $match: {
      customerId,
      ...cursorCondition,
    },
  };

  const limitStage = {
    $limit: limit + 1,
  };

  const blocked = await BlockedModel.aggregate<
    Blocked & { _id: StringOrObjectId }
  >([matchStage, { $sort: { _id: 1 } }, limitStage]);

  const totalCount = await BlockedModel.countDocuments({ customerId });
  const hasNextPage = blocked.length > limit;
  const results = hasNextPage ? blocked.slice(0, -1) : blocked;

  return {
    results,
    nextCursor: hasNextPage
      ? results[results.length - 1]._id.toString()
      : undefined,
    totalCount,
  };
};

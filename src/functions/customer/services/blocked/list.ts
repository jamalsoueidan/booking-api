import mongoose from "mongoose";
import { BlockedModel } from "~/functions/blocked/blocked.model";
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
    $limit: limit,
  };

  // Query to get the documents
  const results = await BlockedModel.aggregate([
    matchStage,
    { $sort: { _id: 1 } }, // Ensure results are sorted for consistent pagination
    limitStage,
  ]);

  const totalCount = await BlockedModel.countDocuments({ customerId });

  // Calculate nextCursor based on the last document in the results, if any
  const newNextCursor =
    results.length > 0 ? results[results.length - 1]._id.toString() : null;

  return {
    results,
    totalCount,
    nextCursor: newNextCursor,
  };
};

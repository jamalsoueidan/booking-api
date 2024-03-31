import { FilterQuery } from "mongoose";
import { IPayoutDocument, PayoutModel } from "~/functions/payout";

export type CustomerPayoutServiceListProps = {
  nextCursor?: Date | string;
  limit?: number;
  sortOrder?: "asc" | "desc";
  filter: { customerId: number };
};

export const CustomerPayoutServiceList = async ({
  nextCursor,
  limit,
  sortOrder = "desc",
  filter,
}: CustomerPayoutServiceListProps) => {
  let query: FilterQuery<IPayoutDocument> = { customerId: filter.customerId };

  const sortParam = sortOrder === "asc" ? 1 : -1; // 1 for 'asc', -1 for 'desc'

  if (nextCursor) {
    query = {
      ...query,
      createdAt: sortParam === 1 ? { $gt: nextCursor } : { $lt: nextCursor },
    };
  }

  const l = limit || 10;
  const payouts = await PayoutModel.find(query)
    .sort({ createdAt: sortParam })
    .limit(l + 1);

  const totalCount = await PayoutModel.countDocuments(query);
  const hasNextPage = payouts.length > l;
  const results = hasNextPage ? payouts.slice(0, -1) : payouts;

  return {
    results,
    nextCursor: hasNextPage ? results[results.length - 1].createdAt : undefined,
    total: totalCount,
  };
};

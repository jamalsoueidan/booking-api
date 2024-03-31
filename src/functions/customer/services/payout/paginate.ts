import { FilterQuery } from "mongoose";
import { IPayoutDocument, PayoutModel } from "~/functions/payout";

export type CustomerPayoutServicePaginateProps = {
  page?: number; // Use page number instead of nextCursor
  limit?: number;
  sortOrder?: "asc" | "desc";
  customerId: number;
};

export const CustomerPayoutServicePaginate = async ({
  page = 1,
  limit = 10,
  sortOrder = "desc",
  customerId,
}: CustomerPayoutServicePaginateProps) => {
  let query: FilterQuery<IPayoutDocument> = { customerId };

  const sortParam = sortOrder === "asc" ? 1 : -1;
  const skip = (page - 1) * limit;

  const totalCount = await PayoutModel.countDocuments(query);
  const payouts = await PayoutModel.find(query)
    .sort({ createdAt: sortParam })
    .skip(skip)
    .limit(limit);

  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;

  return {
    results: payouts,
    currentPage: page,
    totalPages,
    hasNextPage,
    totalCount,
  };
};

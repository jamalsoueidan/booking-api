import { FilterQuery } from "mongoose";
import { IPayoutDocument, PayoutModel } from "~/functions/payout";

export type CustomerPayoutServiceListProps = {
  page?: number; // Use page number instead of nextCursor
  limit?: number;
  sortOrder?: "asc" | "desc";
  filter: { customerId: number };
};

export const CustomerPayoutServiceList = async ({
  page = 1, // Default to the first page if not provided
  limit = 10, // Default limit
  sortOrder = "desc",
  filter,
}: CustomerPayoutServiceListProps) => {
  let query: FilterQuery<IPayoutDocument> = { customerId: filter.customerId };

  const sortParam = sortOrder === "asc" ? 1 : -1;
  const skip = (page - 1) * limit; // Calculate the number of documents to skip

  const totalCount = await PayoutModel.countDocuments(query);
  const payouts = await PayoutModel.find(query)
    .sort({ createdAt: sortParam })
    .skip(skip) // Skip documents for previous pages
    .limit(limit); // Limit to 'limit' documents

  const totalPages = Math.ceil(totalCount / limit); // Calculate total pages
  const hasNextPage = page < totalPages; // Check if there's a next page

  return {
    results: payouts,
    currentPage: page,
    totalPages,
    hasNextPage,
    totalCount,
  };
};

import { FilterQuery } from "mongoose";
import { OrderModel } from "~/functions/order/order.models";
import {
  IPayoutLogDocument,
  PayoutLogModel,
  PayoutLogReferenceType,
} from "~/functions/payout-log";
import { ShippingModel } from "~/functions/shipping/shipping.model";

export type CustomerServicePayoutLogPaginateProps = {
  page: number;
  customerId: number;
  payoutId: number;
  limit?: number;
  sortOrder?: "asc" | "desc";
};

export const CustomerServicePayoutLogPaginate = async ({
  page = 1,
  limit = 10,
  sortOrder = "desc",
  customerId,
  payoutId,
}: CustomerServicePayoutLogPaginateProps) => {
  let query: FilterQuery<IPayoutLogDocument> = {
    customerId,
    payout: payoutId,
  };

  const sortParam = sortOrder === "asc" ? 1 : -1;
  const skipDocuments = (page - 1) * limit;

  const totalCount = await PayoutLogModel.countDocuments(query);
  const totalPages = Math.ceil(totalCount / limit);

  const logs = await PayoutLogModel.aggregate([
    { $match: query },
    { $sort: { createdAt: sortParam } },
    { $skip: skipDocuments },
    { $limit: limit },
    {
      $facet: {
        LineItem: [
          { $match: { referenceType: PayoutLogReferenceType.LINE_ITEM } },
          {
            $lookup: {
              from: OrderModel.collection.name,
              let: { lineItemId: "$referenceId" },
              pipeline: [
                {
                  $match: {
                    "line_items.properties.customerId": customerId,
                  },
                },
                { $unwind: "$line_items" },
                {
                  $match: {
                    $expr: { $eq: ["$line_items.id", "$$lineItemId"] },
                  },
                },
                { $project: { line_item: "$line_items", _id: 0 } },
                { $limit: 1 },
              ],
              as: "relatedDocument",
            },
          },
        ],
        Shipping: [
          { $match: { referenceType: PayoutLogReferenceType.SHIPPING } },
          {
            $lookup: {
              from: ShippingModel.collection.name,
              localField: "referenceId",
              foreignField: "_id",
              as: "relatedDocument",
            },
          },
        ],
      },
    },
    {
      $project: {
        results: { $setUnion: ["$LineItem", "$Shipping"] }, // Combine these arrays back into a single array
      },
    },
    { $unwind: "$results" },
    { $replaceRoot: { newRoot: "$results" } },
    {
      $unwind: {
        path: "$relatedDocument",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        relatedDocument: {
          $cond: {
            if: { $eq: ["$referenceType", PayoutLogReferenceType.LINE_ITEM] },
            then: "$relatedDocument.line_item",
            else: "$relatedDocument",
          },
        },
      },
    },
  ]);

  return {
    results: logs,
    currentPage: page,
    totalPages,
    totalCount,
  };
};

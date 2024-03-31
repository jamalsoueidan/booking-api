import { FilterQuery } from "mongoose";
import { OrderModel } from "~/functions/order/order.models";
import {
  IPayoutLogDocument,
  PayoutLogModel,
  PayoutLogReferenceType,
} from "~/functions/payout-log";
import { ShippingModel } from "~/functions/shipping/shipping.model";

export type CustomerServicePayoutLogListProps = {
  nextCursor?: Date | string;
  limit?: number;
  sortOrder?: "asc" | "desc";
  filter: { customerId: number; payoutId: number };
};

export const CustomerServicePayoutLogList = async ({
  nextCursor,
  limit,
  sortOrder = "desc",
  filter,
}: CustomerServicePayoutLogListProps) => {
  let query: FilterQuery<IPayoutLogDocument> = {
    customerId: filter.customerId,
    payout: filter.payoutId,
  };

  const sortParam = sortOrder === "asc" ? 1 : -1;

  if (nextCursor) {
    query = {
      ...query,
      createdAt: sortParam === 1 ? { $gt: nextCursor } : { $lt: nextCursor },
    };
  }
  const maxLimit = limit || 10;

  const totalCount = await PayoutLogModel.countDocuments(query);
  const logs = await PayoutLogModel.aggregate([
    { $match: query },
    { $sort: { createdAt: sortParam } },
    { $limit: maxLimit },
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
                    "line_items.properties.customerId": filter.customerId,
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
    nextCursor:
      logs.length >= maxLimit ? logs[logs.length - 1].createdAt : undefined,
    total: totalCount,
  };
};

import { FilterQuery } from "mongoose";
import { OrderModel } from "~/functions/order/order.models";
import { OrderLineItem } from "~/functions/order/order.types";
import {
  IPayoutLogDocument,
  PayoutLog,
  PayoutLogModel,
  PayoutLogReferenceType,
} from "~/functions/payout-log";
import { ShippingModel } from "~/functions/shipping/shipping.model";
import { Shipping } from "~/functions/shipping/shipping.types";
import { StringOrObjectId } from "~/library/zod";

export type CustomerPayoutLogServicePaginateProps = {
  page: number;
  customerId: number;
  payoutId: StringOrObjectId;
  limit?: number;
  sortOrder?: "asc" | "desc";
};

export const CustomerPayoutLogServicePaginate = async ({
  page = 1,
  limit = 10,
  sortOrder = "desc",
  customerId,
  payoutId,
}: CustomerPayoutLogServicePaginateProps) => {
  let query: FilterQuery<IPayoutLogDocument> = {
    customerId,
    payout: payoutId,
  };

  const sortParam = sortOrder === "asc" ? 1 : -1;
  const skipDocuments = (page - 1) * limit;

  const totalCount = await PayoutLogModel.countDocuments(query);
  const totalPages = Math.ceil(totalCount / limit);

  const logs = await PayoutLogModel.aggregate<
    PayoutLog & { referenceDocument: OrderLineItem | Shipping }
  >([
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
                {
                  $project: {
                    line_item: {
                      $mergeObjects: [
                        "$line_items",
                        {
                          created_at: "$created_at",
                        },
                      ],
                    },
                    _id: 0,
                  },
                },
                { $limit: 1 },
              ],
              as: "referenceDocument",
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
              as: "referenceDocument",
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
        path: "$referenceDocument",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        referenceDocument: {
          $cond: {
            if: { $eq: ["$referenceType", PayoutLogReferenceType.LINE_ITEM] },
            then: "$referenceDocument.line_item",
            else: "$referenceDocument",
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

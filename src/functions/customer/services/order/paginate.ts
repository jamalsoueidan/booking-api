import { PipelineStage } from "mongoose";
import { OrderModel } from "~/functions/order/order.models";
import { CustomerBookingServiceRangeAggregate } from "../booking/range";

export type CustomerOrderServiceListProps = {
  customerId: number;
  limit?: number;
  nextCursor?: Date | string;
};

export const CustomerOrderServicePaginate = async ({
  customerId,
  nextCursor,
  limit = 10,
}: CustomerOrderServiceListProps) => {
  const pipeline: PipelineStage[] = [
    {
      $match: {
        "line_items.properties.customerId": customerId,
      },
    },
    { $unwind: "$line_items" },
    {
      $match: {
        "line_items.properties.customerId": customerId,
      },
    },
    {
      $sort: { "line_items.properties.from": 1 },
    },
  ];

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  pipeline.push({
    $match: {
      start: { $gte: nextCursor || todayStart },
    },
  });

  const totalCount = await OrderModel.aggregate([
    ...pipeline,
    { $count: "totalCount" },
  ]);

  pipeline.push(
    {
      $skip: 0,
    },
    {
      $limit: limit,
    },
    {
      $addFields: {
        refunds: {
          $filter: {
            input: "$refunds",
            as: "refund",
            cond: {
              $anyElementTrue: {
                $map: {
                  input: "$$refund.refund_line_items",
                  as: "refund_line_item",
                  in: {
                    $eq: ["$$refund_line_item.line_item_id", "$line_items.id"],
                  },
                },
              },
            },
          },
        },
        fulfillments: {
          $filter: {
            input: "$fulfillments",
            as: "fulfillment",
            cond: {
              $anyElementTrue: {
                $map: {
                  input: "$$fulfillment.line_items",
                  as: "fulfillment_line_item",
                  in: {
                    $eq: ["$$fulfillment_line_item.id", "$line_items.id"],
                  },
                },
              },
            },
          },
        },
      },
    },
    {
      $project: {
        id: 1,
        line_items: 1,
        customer: 1,
        order_number: 1,
        fulfillment_status: 1,
        financial_status: 1,
        created_at: 1,
        updated_at: 1,
        cancel_reason: 1,
        cancelled_at: 1,
        note: 1,
        note_attributes: 1,
        fulfillments: 1,
        refunds: 1,
      },
    }
  );

  const results =
    await OrderModel.aggregate<CustomerBookingServiceRangeAggregate>(pipeline);

  return {
    results,
    totalCount: totalCount.length > 0 ? totalCount[0].totalCount : 0,
    nextCursor: results.length > 0 ? results[results.length - 1].start : null,
  };
};

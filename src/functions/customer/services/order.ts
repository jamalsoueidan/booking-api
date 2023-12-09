import { Booking } from "~/functions/booking";
import { OrderModel } from "~/functions/order/order.models";

export type CustomerOrderServiceListProps = {
  customerId: number;
};

export const CustomerOrderServiceList = async ({
  customerId,
}: CustomerOrderServiceListProps) => {
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  return OrderModel.aggregate<Booking>([
    {
      $match: {
        $and: [
          {
            "line_items.properties": {
              $elemMatch: { name: "_customerId", value: customerId },
            },
          },
          {
            "line_items.properties": {
              $elemMatch: { name: "_from", value: { $gte: todayStart } },
            },
          },
        ],
      },
    },
    { $unwind: "$line_items" },
    {
      $match: {
        $and: [
          {
            "line_items.properties": {
              $elemMatch: { name: "_customerId", value: customerId },
            },
          },
          {
            "line_items.properties": {
              $elemMatch: { name: "_from", value: { $gte: todayStart } },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        "line_items._from": {
          $reduce: {
            input: "$line_items.properties",
            initialValue: null,
            in: {
              $cond: {
                if: { $eq: ["$$this.name", "_from"] },
                then: "$$this.value",
                else: "$$value",
              },
            },
          },
        },
      },
    },
    {
      $sort: { "line_items._from": 1 }, // 1 for ascending order, -1 for descending
    },
    {
      $addFields: {
        "line_items.refunds": {
          $filter: {
            input: {
              $reduce: {
                input: "$refunds",
                initialValue: [],
                in: { $concatArrays: ["$$value", "$$this.refund_line_items"] },
              },
            },
            as: "refund_line_item",
            cond: {
              $eq: ["$$refund_line_item.line_item_id", "$line_items._id"],
            },
          },
        },
      },
    },
    {
      $addFields: {
        "line_items.fulfillments": {
          $cond: {
            if: { $eq: [{ $size: "$line_items.refunds" }, 0] },
            then: {
              $filter: {
                input: {
                  $reduce: {
                    input: "$fulfillments",
                    initialValue: [],
                    in: { $concatArrays: ["$$value", "$$this.line_items"] },
                  },
                },
                as: "fulfillment_line_item",
                cond: {
                  $eq: ["$$fulfillment_line_item._id", "$line_items._id"],
                },
              },
            },
            else: [],
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
      },
    },
  ]);
};

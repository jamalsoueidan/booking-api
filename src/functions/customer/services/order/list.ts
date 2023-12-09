import { OrderModel } from "~/functions/order/order.models";
import {
  Order,
  OrderFulfillment,
  OrderLineItem,
  OrderRefund,
  OrderRefundLineItem,
} from "~/functions/order/order.types";

export type CustomerOrderServiceListProps = {
  customerId: number;
  year: number;
  month: number;
};

export type CustomerOrderServiceListAggregate = Omit<
  Order,
  "line_items" | "refunds" | "fulfillments"
> & {
  line_items: OrderLineItem;
  fulfillments: Array<Omit<OrderFulfillment, "line_items">>;
  refunds: Array<
    Omit<OrderRefund, "refund_line_items"> & {
      refund_line_items: Array<Omit<OrderRefundLineItem, "line_item">>;
    }
  >;
};

export const CustomerOrderServiceList = async ({
  customerId,
  year,
  month,
}: CustomerOrderServiceListProps) => {
  const firstDayOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const lastDayOfMonth = new Date(Date.UTC(year, month, 0));

  return OrderModel.aggregate<CustomerOrderServiceListAggregate>([
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
              $elemMatch: {
                name: "_from",
                value: {
                  $gte: firstDayOfMonth,
                  $lte: lastDayOfMonth,
                },
              },
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
              $elemMatch: {
                name: "_from",
                value: {
                  $gte: firstDayOfMonth,
                  $lte: lastDayOfMonth,
                },
              },
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
    },
  ]);
};

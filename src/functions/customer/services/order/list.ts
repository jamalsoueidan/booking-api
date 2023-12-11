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
  start: string;
  end: string;
};

export type CustomerOrderServiceListAggregate = Omit<
  Order,
  "line_items" | "refunds" | "fulfillments"
> & {
  start: Date;
  end: Date;
  title: Date;
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
  start,
  end,
}: CustomerOrderServiceListProps) => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  return OrderModel.aggregate<CustomerOrderServiceListAggregate>([
    {
      $match: {
        $and: [
          {
            "line_items.properties.customerId": customerId,
          },
          {
            "line_items.properties.from": {
              $gte: startDate,
              $lte: endDate,
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
            "line_items.properties.customerId": customerId,
          },
          {
            "line_items.properties.from": {
              $gte: startDate,
              $lte: endDate,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        start: "$line_items.properties.from",
        end: "$line_items.properties.to",
        title: "$line_items.title",
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
      $sort: { start: 1 },
    },
    {
      $project: {
        id: 1,
        start: 1,
        end: 1,
        title: 1,
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

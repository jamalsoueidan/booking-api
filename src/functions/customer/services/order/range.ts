import { OrderModel } from "~/functions/order/order.models";
import {
  Order,
  OrderFulfillment,
  OrderLineItem,
  OrderRefund,
  OrderRefundLineItem,
} from "~/functions/order/order.types";
import { Shipping } from "~/functions/shipping/shipping.types";

export type CustomerOrderServiceRangeProps = {
  customerId: number;
  start: string;
  end: string;
};

export type CustomerOrderServiceRangeAggregate = Omit<
  Order,
  "line_items" | "refunds" | "fulfillments"
> & {
  start: Date;
  end: Date;
  title: Date;
  line_items: OrderLineItem;
  shipping?: Shipping;
  fulfillments: Array<Omit<OrderFulfillment, "line_items">>;
  refunds: Array<
    Omit<OrderRefund, "refund_line_items"> & {
      refund_line_items: Array<Omit<OrderRefundLineItem, "line_item">>;
    }
  >;
};

export const CustomerOrderServiceRange = async ({
  customerId,
  start,
  end,
}: CustomerOrderServiceRangeProps) => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  return OrderModel.aggregate<CustomerOrderServiceRangeAggregate>([
    {
      $match: {
        $and: [
          {
            $or: [
              {
                "line_items.properties.customerId": customerId,
              },
              {
                "customer.id": customerId,
              },
            ],
          },
          {
            $and: [
              {
                "line_items.properties.from": {
                  $gte: startDate,
                },
              },
              {
                "line_items.properties.to": {
                  $lte: endDate,
                },
              },
            ],
          },
        ],
      },
    },
    { $unwind: "$line_items" },
    {
      $match: {
        $and: [
          {
            $or: [
              {
                "line_items.properties.customerId": customerId,
              },
              {
                "customer.id": customerId,
              },
            ],
          },
          {
            $and: [
              {
                "line_items.properties.from": {
                  $gte: startDate,
                },
              },
              {
                "line_items.properties.to": {
                  $lte: endDate,
                },
              },
            ],
          },
        ],
      },
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
      $sort: {
        "line_items.properties.groupId": 1,
        "line_items.properties.from": 1,
      },
    },
    {
      $group: {
        _id: "$line_items.properties.groupId",
        line_items: { $push: "$line_items" },
        customer: { $first: "$customer" },
        orderNumber: { $first: "$order_number" },
        fulfillmentStatus: { $first: "$fulfillment_status" },
        financialStatus: { $first: "$financial_status" },
        createdAt: { $first: "$created_at" },
        updatedAt: { $first: "$updated_at" },
        cancelReason: { $first: "$cancel_reason" },
        cancelledAt: { $first: "$cancelled_at" },
        note: { $first: "$note" },
        noteAttributes: { $first: "$note_attributes" },
        fulfillmentsArray: { $push: "$fulfillments" },
        refundsArray: { $push: "$refunds" },
      },
    },
    {
      $addFields: {
        shippingId: { $first: "$line_items.properties.shippingId" },
        end: { $last: "$line_items.properties.to" },
        start: { $first: "$line_items.properties.from" },
      },
    },
    {
      $lookup: {
        from: "Shipping",
        let: { shippingId: "$shippingId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$_id", { $toObjectId: "$$shippingId" }],
                  },
                ],
              },
            },
          },
          {
            $project: {
              origin: 1,
              destination: 1,
              duration: 1,
              distance: 1,
              cost: 1,
            },
          },
        ],
        as: "shipping",
      },
    },
    {
      $unwind: {
        path: "$shipping",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        start: {
          $cond: {
            if: { $gt: ["$shipping.duration.value", 0] },
            then: {
              $dateSubtract: {
                startDate: "$start",
                unit: "minute",
                amount: { $toInt: "$shipping.duration.value" },
              },
            },
            else: "$start",
          },
        },
        end: {
          $cond: {
            if: { $gt: ["$shipping.duration.value", 0] },
            then: {
              $dateAdd: {
                startDate: "$end",
                unit: "minute",
                amount: { $toInt: "$shipping.duration.value" },
              },
            },
            else: "$end",
          },
        },
      },
    },
    {
      $project: {
        id: "$_id",
        start: 1,
        end: 1,
        shipping: 1,
        line_items: 1,
        customer: 1,
        orderNumber: 1,
        fulfillmentStatus: 1,
        financialStatus: 1,
        createdAt: 1,
        updatedAt: 1,
        cancelReason: 1,
        cancelledAt: 1,
        note: 1,
        noteAttributes: 1,
        fulfillments: {
          $reduce: {
            input: "$fulfillmentsArray",
            initialValue: [],
            in: { $concatArrays: ["$$value", "$$this"] },
          },
        },
        refunds: {
          $reduce: {
            input: "$refundsArray",
            initialValue: [],
            in: { $concatArrays: ["$$value", "$$this"] },
          },
        },
      },
    },
  ]);
};

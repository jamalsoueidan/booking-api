import { OrderModel } from "~/functions/order/order.models";
import { OrderLineItem } from "~/functions/order/order.types";
import { NotFoundError } from "~/library/handler";
import { CustomerOrderServiceListAggregate } from "./list";

export type CustomerOrderServiceGetProps = {
  customerId: number;
  orderId: number;
};

export const CustomerOrderServiceGet = async ({
  customerId,
  orderId,
}: CustomerOrderServiceGetProps) => {
  const orders = await OrderModel.aggregate<
    Omit<CustomerOrderServiceListAggregate, "line_items"> & {
      line_items: OrderLineItem[];
    }
  >([
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
            id: orderId,
          },
        ],
      },
    },
    { $unwind: "$line_items" },
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
      $group: {
        _id: "$id",
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
      $project: {
        id: "$_id",
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

  if (orders.length === 0) {
    throw new NotFoundError([
      {
        code: "custom",
        message: "ORDER_NOT_FOUND",
        path: ["lineItemId"],
      },
    ]);
  }

  return orders[0];
};

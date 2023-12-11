import { OrderModel } from "~/functions/order/order.models";
import { NotFoundError } from "~/library/handler";
import { CustomerOrderServiceListAggregate } from "./list";

export type CustomerOrderServiceGetProps = {
  customerId: number;
  lineItemId: number;
};

export const CustomerOrderServiceGet = async ({
  customerId,
  lineItemId,
}: CustomerOrderServiceGetProps) => {
  const orders = await OrderModel.aggregate<CustomerOrderServiceListAggregate>([
    {
      $match: {
        $and: [
          {
            "line_items.properties.customerId": customerId,
          },
          {
            line_items: {
              $elemMatch: { id: lineItemId },
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
            "line_items.id": lineItemId,
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

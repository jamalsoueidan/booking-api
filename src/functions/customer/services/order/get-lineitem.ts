import { OrderModel } from "~/functions/order/order.models";
import {
  Order,
  OrderFulfillment,
  OrderLineItem,
  OrderRefund,
  OrderRefundLineItem,
} from "~/functions/order/order.types";
import { User } from "~/functions/user";
import { NotFoundError } from "~/library/handler";

export type CustomerOrderServiceGetLineItemAggregate = Omit<
  Order,
  "line_items" | "refunds" | "fulfillments"
> & {
  line_items: OrderLineItem & {
    user: Pick<User, "customerId" | "username" | "fullname" | "images">;
  };
  fulfillments: Array<Omit<OrderFulfillment, "line_items">>;
  refunds: Array<
    Omit<OrderRefund, "refund_line_items"> & {
      refund_line_items: Array<Omit<OrderRefundLineItem, "line_item">>;
    }
  >;
};

export type CustomerOrderServiceGetLineItemProps = {
  customerId: number;
  lineItemId: number;
};

export const CustomerOrderServiceGetLineItem = async ({
  customerId,
  lineItemId,
}: CustomerOrderServiceGetLineItemProps) => {
  const orders =
    await OrderModel.aggregate<CustomerOrderServiceGetLineItemAggregate>([
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
              "line_items.id": lineItemId,
            },
          ],
        },
      },
      {
        $lookup: {
          from: "User",
          let: { customerId: "$customerId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: [
                        "$line_items.properties._customerId",
                        "$$customerId",
                      ],
                    },
                  ],
                },
              },
            },
            {
              $project: {
                customerId: 1,
                username: 1,
                createdAt: 1,
                fullname: 1,
                shortDescription: 1,
                "images.profile": "$images.profile",
              },
            },
          ],
          as: "line_items.user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true, // Set to false if you always expect a match
        },
      },
      {
        $lookup: {
          from: "Location",
          let: { locationId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: [
                        { $toObjectId: "$line_items.properties.locationId" },
                        "$$locationId",
                      ],
                    },
                  ],
                },
              },
            },
            {
              $project: {
                name: 1,
                fullAddress: 1,
                customerId: 1,
              },
            },
          ],
          as: "line_items.location",
        },
      },
      {
        $unwind: {
          path: "$line_items.location",
          preserveNullAndEmptyArrays: true, // Set to false if you always expect a match
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
                      $eq: [
                        "$$refund_line_item.line_item_id",
                        "$line_items.id",
                      ],
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

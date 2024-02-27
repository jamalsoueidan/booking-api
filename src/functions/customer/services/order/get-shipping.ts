import { subMinutes } from "date-fns";
import { OrderModel } from "~/functions/order/order.models";
import { NotFoundError } from "~/library/handler";
import { CustomerOrderServiceShippingAggregate } from "./shipping";

export type CustomerOrderServiceGetShippingProps = {
  id: number;
  customerId: number;
};

export const CustomerOrderServiceGetShipping = async ({
  customerId,
  id,
}: CustomerOrderServiceGetShippingProps) => {
  let orders =
    await OrderModel.aggregate<CustomerOrderServiceShippingAggregate>([
      {
        $match: {
          $and: [
            {
              id,
            },
            { "line_items.properties.shippingId": { $exists: true } },
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
          ],
        },
      },
      { $unwind: "$line_items" },
      {
        $match: {
          $and: [
            {
              id,
            },
            { "line_items.properties.shippingId": { $exists: true } },
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
        },
      },
      {
        $match: {
          refunds: { $size: 0 },
        },
      },
      {
        $lookup: {
          from: "Shipping",
          let: { shippingId: "$line_items.properties.shippingId" },
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
        $sort: { start: 1 },
      },
      {
        $group: {
          _id: "$shipping._id",
          shipping: { $first: "$shipping" },
          id: { $first: "$id" },
          start: { $first: "$start" },
          end: { $first: "$end" },
          title: { $first: "$title" },
          customer: { $first: "$customer" },
          order_number: { $first: "$order_number" },
        },
      },
      {
        $project: {
          id: 1,
          start: 1,
          end: 1,
          title: 1,
          customer: 1,
          order_number: 1,
          shipping: 1,
        },
      },
    ]);

  orders = orders.map((order) => {
    order.end = order.start;
    order.start = subMinutes(order.start, order.shipping.duration.value);
    return order;
  });

  if (orders.length === 0) {
    throw new NotFoundError([
      {
        code: "custom",
        message: "SHIPPING_NOT_FOUND",
        path: ["shippingId"],
      },
    ]);
  }

  return orders[0];
};

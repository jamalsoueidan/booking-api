import { addMinutes, subMinutes } from "date-fns";
import { OrderModel } from "~/functions/order/order.models";
import { Shipping } from "~/functions/shipping/shipping.types";

export type CustomerOrderServiceGetShippingBookedTimeProps = {
  customerId: number;
  start: string | Date;
  end: string | Date;
};

export type CustomerOrderServiceGetShippingBookedTimeAggregate = {
  from: Date;
  to: Date;
  shipping: Shipping;
};

export const CustomerOrderServiceGetShippingBookedTime = async ({
  customerId,
  start,
  end,
}: CustomerOrderServiceGetShippingBookedTimeProps) => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const orders =
    await OrderModel.aggregate<CustomerOrderServiceGetShippingBookedTimeAggregate>(
      [
        {
          $match: {
            $and: [
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
          $sort: {
            "line_items.properties.shippingId": 1,
            "line_items.properties.from": 1,
          },
        },
        {
          $addFields: {
            shippingId: "$line_items.properties.shippingId",
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
                  duration: 1,
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
          $group: {
            _id: "$shipping._id",
            shipping: { $first: "$shipping" },
            id: { $first: "$id" },
            from: { $first: "$line_items.properties.from" },
            to: { $last: "$line_items.properties.to" },
          },
        },
        {
          $project: {
            id: 1,
            from: 1,
            to: 1,
          },
        },
      ]
    );

  return orders.map((order) => {
    order.from = subMinutes(order.from, order.shipping.duration.value);
    order.to = addMinutes(order.to, order.shipping.duration.value);
    return order;
  });
};

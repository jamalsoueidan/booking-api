import { OrderModel } from "~/functions/order/order.models";
import { Shipping } from "~/functions/shipping/shipping.types";
import { OrderAggregate } from "./_types";

export type CustomerOrderServiceShippingProps = {
  customerId: number;
  start: string;
  end: string;
};

export type CustomerOrderServiceShippingAggregate = Pick<
  OrderAggregate,
  "id" | "customer" | "order_number"
> & {
  start: Date;
  end: Date;
  title: Date;
  shipping: Shipping;
};

export const CustomerOrderServiceShipping = async ({
  customerId,
  start,
  end,
}: CustomerOrderServiceShippingProps) => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  return OrderModel.aggregate<CustomerOrderServiceShippingAggregate>([
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
        start: "$line_items.properties.from",
        end: "$line_items.properties.to",
        title: "$line_items.title",
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
    {
      $sort: { start: 1 },
    },
  ]);
};

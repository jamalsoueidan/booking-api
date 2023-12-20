import { OrderModel } from "~/functions/order/order.models";

export type CustomerOrderServiceGetBookedProps = {
  customerId: number;
  start: Date;
  end: Date;
};

export type CustomerOrderServiceGetBookedAggregate = {
  from: Date;
  to: Date;
};

export const CustomerOrderServiceGetBooked = async ({
  customerId,
  start: $gte,
  end: $lte,
}: CustomerOrderServiceGetBookedProps) => {
  return OrderModel.aggregate<CustomerOrderServiceGetBookedAggregate>([
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
            "line_items.properties.from": {
              $gte,
              $lte,
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
            "line_items.properties.from": {
              $gte,
              $lte,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        from: "$line_items.properties.from",
        to: "$line_items.properties.to",
      },
    },
    {
      $project: {
        from: 1,
        to: 1,
      },
    },
  ]);
};

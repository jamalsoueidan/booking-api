import { OrderModel } from "~/functions/order/order.models";

export type CustomerOrderServiceGetOrdersBookedTimesProps = {
  customerId: number;
  start: Date;
  end: Date;
};

export type CustomerOrderServiceGetOrdersBookedTimesAggregate = {
  from: Date;
  to: Date;
};

export const CustomerOrderServiceGetOrdersBookedTimes = async ({
  customerId,
  start: $gte,
  end: $lte,
}: CustomerOrderServiceGetOrdersBookedTimesProps) => {
  return OrderModel.aggregate<CustomerOrderServiceGetOrdersBookedTimesAggregate>(
    [
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
                    $gte,
                  },
                },
                {
                  "line_items.properties.to": {
                    $lte,
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
                    $gte,
                  },
                },
                {
                  "line_items.properties.to": {
                    $lte,
                  },
                },
              ],
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
    ]
  );
};

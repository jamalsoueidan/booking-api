import { OrderModel } from "~/functions/order/order.models";

export type UserAvailabilityServiceGetOrdersProps = {
  customerId: number;
  start: Date;
  end: Date;
};

export type UserAvailabilityServiceGetOrdersAggregate = {
  start: Date;
  end: Date;
};

export const UserAvailabilityServiceGetOrders = async ({
  customerId,
  start: $gte,
  end: $lte,
}: UserAvailabilityServiceGetOrdersProps) => {
  return OrderModel.aggregate<UserAvailabilityServiceGetOrdersAggregate>([
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
            $or: [
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
            $or: [
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
        orderNumber: { $first: "$order_number" },
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
      },
    },
  ]);
};

import { Location } from "~/functions/location";
import { OrderModel } from "~/functions/order/order.models";
import { Shipping } from "~/functions/shipping/shipping.types";
import { User } from "~/functions/user";
import { NotFoundError } from "~/library/handler";
import { CustomerOrderServiceRangeAggregate } from "./range";

export type CustomerOrderServiceGetAggregate =
  CustomerOrderServiceRangeAggregate & {
    user: Pick<
      User,
      "customerId" | "username" | "fullname" | "images" | "shortDescription"
    >;
    location: Pick<
      Location,
      "name" | "fullAddress" | "locationType" | "originType"
    >;
    shipping?: Pick<Shipping, "destination" | "cost" | "distance" | "duration">;
  };

export type CustomerOrderServiceGetProps = {
  customerId: number;
  orderId: number;
  groupId: string;
};

export const CustomerOrderServiceGet = async ({
  customerId,
  orderId,
  groupId,
}: CustomerOrderServiceGetProps) => {
  const orders = await OrderModel.aggregate<CustomerOrderServiceGetAggregate>([
    {
      $match: {
        $and: [
          {
            "line_items.properties.customerId": customerId,
          },
          {
            "line_items.properties.groupId": groupId,
          },
          {
            id: orderId,
          },
        ],
      },
    },
    { $unwind: "$line_items" },
    {
      $match: { "line_items.properties.groupId": groupId },
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
        customerId: { $first: "$line_items.properties.customerId" },
        locationId: { $first: "$line_items.properties.locationId" },
        shippingId: { $first: "$line_items.properties.shippingId" },
        groupId: { $first: "$line_items.properties.groupId" },
        end: { $last: "$line_items.properties.to" },
        start: { $first: "$line_items.properties.from" },
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
                $eq: ["$customerId", "$$customerId"],
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
        as: "user",
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
        let: { locationId: "$locationId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$_id", { $toObjectId: "$$locationId" }],
                  },
                ],
              },
            },
          },
          {
            $project: {
              name: 1,
              fullAddress: 1,
              originType: 1,
              locationType: 1,
            },
          },
        ],
        as: "location",
      },
    },
    {
      $unwind: {
        path: "$location",
        preserveNullAndEmptyArrays: true, // Set to false if you always expect a match
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
        groupId: 1,
        locationId: 1,
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

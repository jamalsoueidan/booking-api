import { Location } from "~/functions/location";
import {
  Order,
  OrderFulfillment,
  OrderLineItem,
  OrderRefund,
  OrderRefundLineItem,
} from "~/functions/order/order.types";
import { Shipping } from "~/functions/shipping/shipping.types";
import { User } from "~/functions/user";

export type OrderLineItemsAggreate = OrderLineItem & {
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

export type OrderAggregate = Omit<
  Order,
  "line_items" | "refunds" | "fulfillments"
> & {
  line_items: OrderLineItemsAggreate;
  fulfillments: Array<Omit<OrderFulfillment, "line_items">>;
  refunds: Array<
    Omit<OrderRefund, "refund_line_items"> & {
      refund_line_items: Array<Omit<OrderRefundLineItem, "line_item">>;
    }
  >;
};

export const OrderLookupProperties = [
  {
    $lookup: {
      from: "User",
      let: { customerId: "$line_items.properties.customerId" },
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
      as: "line_items.user",
    },
  },
  {
    $unwind: {
      path: "$line_items.user",
      preserveNullAndEmptyArrays: true, // Set to false if you always expect a match
    },
  },
  {
    $lookup: {
      from: "Location",
      let: { locationId: "$line_items.properties.locationId" },
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
      as: "line_items.shipping",
    },
  },
  {
    $unwind: {
      path: "$line_items.shipping",
      preserveNullAndEmptyArrays: true,
    },
  },
];

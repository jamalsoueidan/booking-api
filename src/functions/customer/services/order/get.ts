import { Location } from "~/functions/location";
import { OrderModel } from "~/functions/order/order.models";
import { OrderLineItem } from "~/functions/order/order.types";
import { Shipping } from "~/functions/shipping/shipping.types";
import { User } from "~/functions/user";
import { NotFoundError } from "~/library/handler";
import { CustomerBookingServiceRangeAggregate } from "../booking/range";

export type CustomLineItems = OrderLineItem & {
  user: Pick<
    User,
    "customerId" | "username" | "fullname" | "images" | "shortDescription"
  >;
  location: Pick<
    Location,
    "name" | "fullAddress" | "locationType" | "originType"
  >;
  shipping?: Shipping;
};

export type CustomerOrderServiceGetAggregate = Omit<
  CustomerBookingServiceRangeAggregate,
  "line_items" | "shipping" | "location"
> & {
  line_items: CustomLineItems[];
};

export type CustomerOrderServiceGetProps = {
  customerId: number;
  orderId: number;
};

/*
 The purpose of this method is to render the whole order with all the treatments, not just one groupId.
*/
export const CustomerOrderServiceGet = async ({
  customerId,
  orderId,
}: CustomerOrderServiceGetProps) => {
  const orders = await OrderModel.aggregate<CustomerOrderServiceGetAggregate>([
    {
      $match: {
        "customer.id": customerId,
        id: orderId,
      },
    },
    { $unwind: "$line_items" },
    {
      $sort: {
        "line_items.properties.groupId": 1,
        "line_items.properties.from": 1,
      },
    },
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
              origin: 1,
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
    {
      $group: {
        _id: "$order_number",
        id: { $first: "$id" },
        line_items: { $push: "$line_items" },
        customer: { $first: "$customer" },
        order_number: { $first: "$order_number" },
        fulfillment_status: { $first: "$fulfillment_status" },
        financial_status: { $first: "$financial_status" },
        created_at: { $first: "$created_at" },
        updated_at: { $first: "$updated_at" },
        cancel_reason: { $first: "$cancel_reason" },
        cancelled_at: { $first: "$cancelled_at" },
        note: { $first: "$note" },
        note_attributes: { $first: "$note_attributes" },
      },
    },
    {
      $project: {
        id: "$_id",
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

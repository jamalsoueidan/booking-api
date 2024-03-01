import { OrderModel } from "~/functions/order/order.models";
import { NotFoundError } from "~/library/handler";
import { bookingAggregation } from "./aggregation";
import { CustomerBookingServiceRangeAggregate } from "./range";

export type CustomerBookingServiceGetByGroupProps = {
  customerId: number;
  orderId: number;
  groupId: string;
};

export const CustomerBookingServiceGetByGroup = async ({
  customerId,
  orderId,
  groupId,
}: CustomerBookingServiceGetByGroupProps) => {
  const orders =
    await OrderModel.aggregate<CustomerBookingServiceRangeAggregate>([
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
      ...bookingAggregation,
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

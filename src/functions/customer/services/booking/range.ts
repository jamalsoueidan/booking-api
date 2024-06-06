import { Location } from "~/functions/location";
import { OrderModel } from "~/functions/order/order.models";
import { Order } from "~/functions/order/order.types";
import { Shipping } from "~/functions/shipping/shipping.types";
import { bookingAggregation } from "./aggregation";

export type CustomerBookingServiceRangeProps = {
  customerId: number;
  start: string;
  end: string;
};

export type CustomerBookingServiceRangeAggregate = Order & {
  start: Date;
  end: Date;
  groupId: string;
  shippingId: string;
  title: string;
  shipping?: Shipping;
  location: Pick<Location, "name" | "fullAddress" | "locationType">;
};

export const CustomerBookingServiceRange = async ({
  customerId,
  start: startDate,
  end: endDate,
}: CustomerBookingServiceRangeProps) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return OrderModel.aggregate<CustomerBookingServiceRangeAggregate>([
    {
      $match: {
        "line_items.properties.customerId": customerId,
        $or: [
          {
            "line_items.properties.from": {
              $gte: start,
              $lte: end,
            },
          },
          {
            "line_items.properties.to": {
              $gte: start,
              $lte: end,
            },
          },
        ],
      },
    },
    { $unwind: "$line_items" },
    {
      $match: {
        "line_items.properties.customerId": customerId,
        $or: [
          {
            "line_items.properties.from": {
              $gte: start,
              $lte: end,
            },
          },
          {
            "line_items.properties.to": {
              $gte: start,
              $lte: end,
            },
          },
        ],
      },
    },
    ...bookingAggregation,
  ]);
};

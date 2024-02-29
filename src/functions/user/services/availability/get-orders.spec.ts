import { isWithinInterval } from "date-fns";
import { OrderModel } from "~/functions/order/order.models";
import { getOrderObject } from "~/library/jest/helpers/order";
import { UserAvailabilityServiceGetOrders } from "./get-orders";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerOrderServiceGet", () => {
  it("should return booked lineItems from booking", async () => {
    const customerId = 1;
    const dumbData = getOrderObject({ customerId, lineItemsTotal: 10 });
    await OrderModel.create(dumbData);

    const start = dumbData.line_items[0].properties!.from;
    const end =
      dumbData.line_items[dumbData.line_items.length - 1].properties!.to;

    const orders = await UserAvailabilityServiceGetOrders({
      customerId,
      start,
      end,
    });

    orders.forEach((order) => {
      const isStartWithinInterval = isWithinInterval(order.start, {
        start: start,
        end: end,
      });
      const isEndWithinInterval = isWithinInterval(order.end, {
        start: start,
        end: end,
      });

      console.log(
        order.start,
        isStartWithinInterval,
        order.end,
        isEndWithinInterval
      );
      expect(isStartWithinInterval || isEndWithinInterval).toBeTruthy();
    });
  });
});

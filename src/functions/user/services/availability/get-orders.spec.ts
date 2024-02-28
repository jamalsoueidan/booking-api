import { addDays } from "date-fns";
import { OrderModel } from "~/functions/order/order.models";
import { getOrderObject } from "~/library/jest/helpers/order";
import { UserAvailabilityServiceGetOrders } from "./get-orders";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerOrderServiceGet", () => {
  it("should return booked lineItems from booking", async () => {
    const customerId = 1;
    const dumbData = getOrderObject({ customerId, lineItemsTotal: 50 });
    await OrderModel.create(dumbData);

    const start = new Date();
    const end = addDays(new Date(), 7);

    const orders = await UserAvailabilityServiceGetOrders({
      customerId,
      start,
      end,
    });

    orders.forEach((order) => {
      expect(order.start.getTime()).toBeGreaterThanOrEqual(start.getTime());
      expect(order.end.getTime()).toBeLessThanOrEqual(end.getTime());
    });
  });
});

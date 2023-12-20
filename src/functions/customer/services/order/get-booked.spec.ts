import { addDays, isWithinInterval } from "date-fns";
import { OrderModel } from "~/functions/order/order.models";
import { getOrderObject } from "~/library/jest/helpers/order";
import { CustomerOrderServiceGetBooked } from "./get-booked";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerOrderService", () => {
  it("should return booked lineItems from booking", async () => {
    const customerId = 1;
    const dumbData = getOrderObject({ customerId, lineItemsTotal: 50 });
    await OrderModel.create(dumbData);

    const start = new Date();
    const end = addDays(new Date(), 7);

    const filteredLineItems = dumbData.line_items.filter((lineItem) => {
      const from = new Date(lineItem.properties!.from);
      const to = new Date(lineItem.properties!.to);

      return (
        isWithinInterval(from, { start, end }) ||
        isWithinInterval(to, { start, end })
      );
    });

    const orders = await CustomerOrderServiceGetBooked({
      customerId,
      start,
      end,
    });

    expect(orders.length).toEqual(filteredLineItems.length);

    orders.forEach((order) => {
      expect(order.from.getTime()).toBeGreaterThanOrEqual(start.getTime());
      expect(order.to.getTime()).toBeLessThanOrEqual(end.getTime());
    });
  });
});

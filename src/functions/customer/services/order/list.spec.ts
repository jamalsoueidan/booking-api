import { OrderModel } from "~/functions/order/order.models";
import { Order } from "~/functions/order/order.types";
import { orderWithfulfillmentAndRefunds } from "~/functions/webhook/data-ordre-with-fullfilment-and-refunds";
import { CustomerOrderServiceList } from "./list";
require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerOrderServiceList", () => {
  it("should return orders for customer on specific year/month", async () => {
    const dumbData = Order.parse(orderWithfulfillmentAndRefunds);
    const response = await OrderModel.create(dumbData);

    const customerId = response.line_items[0].properties?.find(
      (p) => p.name === "_customerId"
    )?.value as number | undefined;

    const orders = await CustomerOrderServiceList({
      customerId: customerId || 0,
      start: "2023-11-26T00:00:00+03:00",
      end: "2024-01-07T00:00:00+03:00",
    });

    expect(orders.length).toBe(2);
  });
});

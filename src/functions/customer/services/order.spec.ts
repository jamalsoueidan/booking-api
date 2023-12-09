import { OrderModel } from "~/functions/order/order.models";
import { Order } from "~/functions/order/order.types";
import { orderWithfulfillmentAndRefunds } from "~/functions/webhook/data-ordre-with-fullfilment-and-refunds";
import { CustomerOrderServiceList } from "./order";
require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerOrderService", () => {
  it("should return upcoming orders for customer", async () => {
    const dumbData = Order.parse(orderWithfulfillmentAndRefunds);
    const response = await OrderModel.create(dumbData);

    const customerId = response.line_items[0].properties?.find(
      (p) => p.name === "_customerId"
    )?.value as number | undefined;

    const orders = await CustomerOrderServiceList({
      customerId: customerId || 0,
    });
  });
});

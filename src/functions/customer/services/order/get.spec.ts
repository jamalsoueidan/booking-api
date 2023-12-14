import { OrderModel } from "~/functions/order/order.models";
import { Order } from "~/functions/order/order.types";
import { orderWithfulfillmentAndRefunds } from "~/functions/webhook/data-ordre-with-fullfilment-and-refunds";
import { CustomerOrderServiceGet } from "./get";
require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerOrderServiceGet", () => {
  it("should return order by line-item for customer", async () => {
    const dumbData = Order.parse(orderWithfulfillmentAndRefunds);
    const response = await OrderModel.create(dumbData);

    const orderId = response.id;
    const customerId = response.customer.id;

    const order = await CustomerOrderServiceGet({
      customerId,
      orderId,
    });

    expect(order.line_items.length).toBe(2);
    expect(order.fulfillments.length).toBe(2);
    expect(order.refunds.length).toBe(1);
  });
});

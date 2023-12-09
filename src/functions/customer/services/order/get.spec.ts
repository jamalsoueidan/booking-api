import { OrderModel } from "~/functions/order/order.models";
import { Order } from "~/functions/order/order.types";
import { orderWithfulfillmentAndRefunds } from "~/functions/webhook/data-ordre-with-fullfilment-and-refunds";
import { CustomerOrderServiceGet } from "./get";
require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerOrderServiceGet", () => {
  it("should return order by line-item for customer", async () => {
    const dumbData = Order.parse(orderWithfulfillmentAndRefunds);
    const response = await OrderModel.create(dumbData);

    const lineItemId = response.line_items[0].id;

    const customerId = response.line_items[0].properties?.find(
      (p) => p.name === "_customerId"
    )?.value as number | undefined;

    const order = await CustomerOrderServiceGet({
      customerId: customerId || 0,
      lineItemId,
    });

    expect(order.line_items.id).toEqual(lineItemId);
    expect(order.fulfillments.length).toBe(1);
    expect(order.refunds.length).toBe(1);
  });
});

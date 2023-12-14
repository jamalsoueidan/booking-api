import { OrderModel } from "~/functions/order/order.models";
import { Order } from "~/functions/order/order.types";
import { orderWithfulfillmentAndRefunds } from "~/functions/webhook/data-ordre-with-fullfilment-and-refunds";
import { createUser } from "~/library/jest/helpers";
import { createLocation } from "~/library/jest/helpers/location";
import { CustomerOrderServiceGetLineItem } from "./get-lineitem";
require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerOrderServiceGetLineItem", () => {
  it("should return order by line-item for customer", async () => {
    const customerId = 7106990342471;

    const user = await createUser({ customerId });
    const location = await createLocation({ customerId });
    const dumbData = Order.parse(orderWithfulfillmentAndRefunds);
    dumbData.line_items[0].properties!.locationId = location._id.toString();
    const response = await OrderModel.create(dumbData);

    const lineItemId = response.line_items[0].id;

    // both the beauty professional and customer can see the order
    const ownerCustomerId = response.customer.id;
    const beautyCustomerId = response.line_items[0].properties?.customerId || 0;

    let order = await CustomerOrderServiceGetLineItem({
      customerId: beautyCustomerId,
      lineItemId,
    });

    console.log(order.line_items);
    expect(order.line_items.user).toBeDefined();
    expect(order.line_items.id).toEqual(lineItemId);
    expect(order.fulfillments.length).toBe(1);
    expect(order.refunds.length).toBe(1);

    order = await CustomerOrderServiceGetLineItem({
      customerId: ownerCustomerId,
      lineItemId,
    });

    expect(order.line_items.id).toEqual(lineItemId);
    expect(order.fulfillments.length).toBe(1);
    expect(order.refunds.length).toBe(1);
  });
});

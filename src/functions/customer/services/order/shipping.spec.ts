import { OrderModel } from "~/functions/order/order.models";
import { Order } from "~/functions/order/order.types";
import { orderWithfulfillmentAndRefunds } from "~/functions/webhook/data-ordre-with-fullfilment-and-refunds";
import { createUser } from "~/library/jest/helpers";
import { createLocation } from "~/library/jest/helpers/location";
import { createShipping } from "~/library/jest/helpers/shipping";
import { CustomerOrderServiceShipping } from "./shipping";
require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerOrderServiceShipping", () => {
  it("should return shipping orders for customer on range of start/end", async () => {
    const customerId = 7106990342471;
    const user = await createUser({ customerId: 7106990342471 });
    const location = await createLocation({ customerId: user.customerId });
    const shipping = await createShipping({ location: location.id });

    const dumbData = Order.parse(orderWithfulfillmentAndRefunds);
    dumbData.line_items = dumbData.line_items.map((lineItems) => {
      lineItems.properties!.customerId = customerId;
      lineItems.properties!.locationId = location._id.toString();
      lineItems.properties!.shippingId = shipping._id.toString();
      return lineItems;
    });

    await OrderModel.create(dumbData);

    const orders = await CustomerOrderServiceShipping({
      customerId: customerId,
      start: "2023-11-26T00:00:00+03:00",
      end: "2024-01-07T00:00:00+03:00",
    });

    const shippingIds = orders.map((item) => item.shipping._id.toString());
    const uniqueShippingIds = new Set(shippingIds);
    expect(shippingIds.length).toBe(uniqueShippingIds.size);

    orders.forEach((item) => {
      expect(item).toHaveProperty("shipping");
      expect(item.shipping).toBeDefined();
    });
  });
});

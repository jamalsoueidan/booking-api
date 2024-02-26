import { OrderModel } from "~/functions/order/order.models";
import { Order } from "~/functions/order/order.types";
import { orderWithfulfillmentAndRefunds } from "~/functions/webhook/data-ordre-with-fullfilment-and-refunds";
import { createUser } from "~/library/jest/helpers";
import { createLocation } from "~/library/jest/helpers/location";
import { CustomerOrderServiceGet } from "./get";
require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerOrderServiceGet", () => {
  it("should return order by line-item for customer", async () => {
    const customerId = 7106990342471;
    const user = await createUser({ customerId });
    const location = await createLocation({ customerId });
    const dumbData = Order.parse(orderWithfulfillmentAndRefunds);
    dumbData.line_items[0].properties!.customerId = user.customerId;
    dumbData.line_items[0].properties!.locationId = location._id.toString();
    const response = await OrderModel.create(dumbData);

    const orderId = response.id;
    const ownerCustomerId = response.customer.id;

    const order = await CustomerOrderServiceGet({
      customerId: ownerCustomerId,
      orderId,
    });

    expect(order.line_items.length).toBe(2);
    expect(order.fulfillments.length).toBe(2);
    expect(order.refunds.length).toBe(1);
  });
});

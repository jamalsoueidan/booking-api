import { OrderModel } from "~/functions/order/order.models";
import { Order } from "~/functions/order/order.types";
import { orderWithfulfillmentAndRefunds } from "~/functions/webhook/data-order-with-fullfilment-and-refunds";
import { createUser } from "~/library/jest/helpers";
import { createLocation } from "~/library/jest/helpers/location";
import { CustomerOrderServiceGetByGroup } from "./get-by-group";
require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerOrderServiceGetByGroup", () => {
  it("should return order with the correct lineitems for customer/groupId", async () => {
    const customerId = 7106990342471;
    const groupId = "2332";
    const user = await createUser({ customerId });
    const location = await createLocation({ customerId });
    const dumbData = Order.parse(orderWithfulfillmentAndRefunds);
    dumbData.line_items[0].properties!.customerId = user.customerId;
    dumbData.line_items[0].properties!.locationId = location._id.toString();
    dumbData.line_items[0].properties!.groupId = groupId;
    const response = await OrderModel.create(dumbData);

    const orderId = response.id;
    const ownerCustomerId = user.customerId;

    let order = await CustomerOrderServiceGetByGroup({
      customerId: ownerCustomerId,
      orderId,
      groupId,
    });

    expect(order.line_items.length).toBe(1);
    expect(order.fulfillments.length).toBe(1);
    expect(order.refunds.length).toBe(1);

    order = await CustomerOrderServiceGetByGroup({
      customerId: ownerCustomerId,
      orderId,
      groupId: "123",
    });

    expect(order.line_items.length).toBe(2);
    expect(order.fulfillments.length).toBe(2);
    expect(order.refunds.length).toBe(0);
  });
});

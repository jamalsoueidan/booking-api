import { OrderModel } from "~/functions/order/order.models";
import { Order } from "~/functions/order/order.types";
import { orderWithoutShipping } from "~/functions/webhook/data-order-with-without-shipping";
import { createUser } from "~/library/jest/helpers";
import { createLocation } from "~/library/jest/helpers/location";
import { createShipping } from "~/library/jest/helpers/shipping";
import { CustomerOrderServiceGet } from "./get";
require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerOrderServiceGet", () => {
  it("should return order with the correct lineitems for customer/groupId", async () => {
    const customerId = 7106990342471;
    const groupId = "2332";
    const user = await createUser({ customerId });
    const location = await createLocation({ customerId });
    const shipping = await createShipping({ location: location.id });
    const dumbData = Order.parse(orderWithoutShipping);
    dumbData.line_items.map((lineItem) => {
      lineItem.properties!.customerId = user.customerId;
      lineItem.properties!.locationId = location._id.toString();
      lineItem.properties!.groupId = groupId;
    });
    const response = await OrderModel.create(dumbData);
    const orderId = response.id;

    let order = await CustomerOrderServiceGet({
      customerId: dumbData.customer.id,
      orderId,
    });

    expect(order.line_items.length).toBe(3);
  });
});

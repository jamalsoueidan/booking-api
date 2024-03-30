import { OrderModel } from "~/functions/order/order.models";
import { Order } from "~/functions/order/order.types";
import { orderWithoutShipping } from "~/functions/webhook/data-order-with-without-shipping";
import { createUser } from "~/library/jest/helpers";
import { createLocation } from "~/library/jest/helpers/location";
import { CustomerBookingServiceGetByGroup } from "./get-by-group";
require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerOrderServiceGetByGroup", () => {
  it("should return order with the correct lineitems for customer/groupId", async () => {
    const customerId = 7106990342471;
    const groupId = "2332";
    const user = await createUser({ customerId });
    const location = await createLocation({ customerId });
    const dumbData = Order.parse(orderWithoutShipping);
    dumbData.line_items[0].properties!.customerId = user.customerId;
    dumbData.line_items[0].properties!.locationId = location._id.toString();
    dumbData.line_items[0].properties!.groupId = groupId;
    const response = await OrderModel.create(dumbData);

    const orderId = response.id;
    const ownerCustomerId = user.customerId;

    let order = await CustomerBookingServiceGetByGroup({
      customerId: ownerCustomerId,
      orderId,
      groupId,
    });

    expect(order.line_items.length).toBe(1);

    order = await CustomerBookingServiceGetByGroup({
      customerId: ownerCustomerId,
      orderId,
      groupId: "123",
    });

    expect(order.line_items.length).toBe(2);
  });
});

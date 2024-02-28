import { addMinutes, subMinutes } from "date-fns";
import { OrderModel } from "~/functions/order/order.models";
import { Order } from "~/functions/order/order.types";
import { orderWithShipping } from "~/functions/webhook/data-order-with-shipping";
import { createUser } from "~/library/jest/helpers";
import { createLocation } from "~/library/jest/helpers/location";
import { createShipping } from "~/library/jest/helpers/shipping";
import { CustomerOrderServiceGetShippingBookedTime } from "./get-shipping-booked-time";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerOrderServiceGetShippingBookedTime", () => {
  it("should return shipping orders for customer on range of start/end", async () => {
    const customerId = 7106990342471;
    const user = await createUser({ customerId: 7106990342471 });
    const location = await createLocation({ customerId: user.customerId });
    const shipping1 = await createShipping({ location: location.id });

    const dumbData = Order.parse(orderWithShipping);

    dumbData.line_items[0].properties!.customerId = customerId;
    dumbData.line_items[0].properties!.locationId = location._id.toString();
    dumbData.line_items[0].properties!.shippingId = shipping1._id.toString();
    dumbData.line_items[1].properties!.customerId = customerId;
    dumbData.line_items[1].properties!.locationId = location._id.toString();
    dumbData.line_items[1].properties!.shippingId = shipping1._id.toString();

    await OrderModel.create(dumbData);

    const orders = await CustomerOrderServiceGetShippingBookedTime({
      customerId: customerId,
      start: "2023-11-26T00:00:00+03:00",
      end: "2024-01-07T00:00:00+03:00",
    });

    const start = subMinutes(
      new Date(dumbData.line_items[0].properties!.from),
      orders[0].shipping.duration.value
    );

    const end = addMinutes(
      new Date(dumbData.line_items[1].properties!.to),
      orders[0].shipping.duration.value
    );

    expect(orders[0].from).toEqual(start);
    expect(orders[0].to).toEqual(end);
  });
});

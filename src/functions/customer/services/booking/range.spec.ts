import { addMinutes, subMinutes } from "date-fns";
import { OrderModel } from "~/functions/order/order.models";
import { Order } from "~/functions/order/order.types";
import { orderWithShipping } from "~/functions/webhook/data-order-with-shipping";
import { orderWithoutShipping } from "~/functions/webhook/data-order-with-without-shipping";
import { createUser } from "~/library/jest/helpers";
import { createLocation } from "~/library/jest/helpers/location";
import { createShipping } from "~/library/jest/helpers/shipping";
import { CustomerBookingServiceRange } from "./range";
require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerOrderServiceRange", () => {
  it("should return orders for customer on range of start/end", async () => {
    await createUser({ customerId: 7106990342471 });

    const dumbData = Order.parse(orderWithoutShipping);
    const response = await OrderModel.create(dumbData);

    const customerId = response.line_items[0].properties?.customerId || 0;

    const orders = await CustomerBookingServiceRange({
      customerId: customerId,
      start: "2023-11-26T00:00:00+03:00",
      end: "2024-01-07T00:00:00+03:00",
    });

    expect(orders.length).toBe(2);
  });

  it("should return shipping information", async () => {
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

    const orders = await CustomerBookingServiceRange({
      customerId: customerId,
      start: "2023-11-26T00:00:00+03:00",
      end: "2024-01-07T00:00:00+03:00",
    });

    const shippingIds = orders.map((item) => item.shipping?._id.toString());
    const uniqueShippingIds = new Set(shippingIds);
    expect(shippingIds.length).toBe(uniqueShippingIds.size);

    //atleast one with shipping
    const hasShipping = orders.find((obj) => obj.hasOwnProperty("shipping"));
    expect(hasShipping).toBeDefined();

    const start = subMinutes(
      new Date(dumbData.line_items[0].properties!.from),
      hasShipping?.shipping?.duration.value || 0
    );

    const end = addMinutes(
      new Date(dumbData.line_items[1].properties!.to),
      hasShipping?.shipping?.duration.value || 0
    );

    expect(hasShipping?.start).toEqual(start);
    expect(hasShipping?.end).toEqual(end);
  });
});

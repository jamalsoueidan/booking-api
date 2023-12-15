import { LocationTypes } from "~/functions/location";
import { OrderModel } from "~/functions/order/order.models";
import { Order } from "~/functions/order/order.types";
import { orderWithfulfillmentAndRefunds } from "~/functions/webhook/data-ordre-with-fullfilment-and-refunds";
import { createUser } from "~/library/jest/helpers";
import { createLocation } from "~/library/jest/helpers/location";
import { createSchedule } from "~/library/jest/helpers/schedule";
import { createShipping } from "~/library/jest/helpers/shipping";
import { CustomerOrderServiceGetLineItem } from "./get-lineitem";
require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerOrderServiceGetLineItem", () => {
  it("should return order by line-item for customer", async () => {
    const customerId = 7106990342471;
    const user = await createUser({ customerId });
    const location = await createLocation({ customerId });
    const shipping = await createShipping({});

    const schedule = await createSchedule(
      { customerId },
      {
        days: ["monday", "tuesday"],
        totalProducts: 2,
        locations: [
          { location: location._id, locationType: LocationTypes.ORIGIN },
        ],
      }
    );

    const dumbData = Order.parse(orderWithfulfillmentAndRefunds);
    dumbData.line_items[0].properties!.customerId = customerId;
    dumbData.line_items[0].properties!.locationId = location._id.toString();
    dumbData.line_items[0].properties!.shippingId = shipping._id.toString();
    dumbData.line_items[0].product_id = schedule.products[0].productId;
    dumbData.line_items[0].variant_id = schedule.products[0].variantId;

    const response = await OrderModel.create(dumbData);

    const lineItemId = response.line_items[0].id;

    const ownerCustomerId = response.customer.id;
    const beautyCustomerId = response.line_items[0].properties?.customerId || 0;

    let order = await CustomerOrderServiceGetLineItem({
      customerId: beautyCustomerId,
      lineItemId,
    });

    expect(order.line_items.selectedOptions).toBeDefined();
    expect(order.line_items.location).toBeDefined();
    expect(order.line_items.shipping).toBeDefined();
    expect(order.line_items.user.customerId).toBe(user.customerId);
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

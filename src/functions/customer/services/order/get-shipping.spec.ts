import { OrderModel } from "~/functions/order/order.models";
import { Order } from "~/functions/order/order.types";
import { orderWithfulfillmentAndRefunds } from "~/functions/webhook/data-ordre-with-fullfilment-and-refunds";
import { createUser } from "~/library/jest/helpers";
import { createLocation } from "~/library/jest/helpers/location";
import { createShipping } from "~/library/jest/helpers/shipping";
import { CustomerOrderServiceGetShipping } from "./get-shipping";
require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerOrderServiceList", () => {
  it("should return one shipping order for customer", async () => {
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

    const order = await CustomerOrderServiceGetShipping({
      customerId: customerId,
      id: orderWithfulfillmentAndRefunds.id,
    });

    expect(order.shipping._id).toEqual(shipping._id);
  });
});

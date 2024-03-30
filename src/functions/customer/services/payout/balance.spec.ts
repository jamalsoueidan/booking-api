import { OrderModel } from "~/functions/order/order.models";
import { Order } from "~/functions/order/order.types";
import { orderWithfulfillmentAndRefunds } from "~/functions/webhook/data-order-with-fullfilment-and-refunds";
import { CustomerPayoutServiceBalance } from "./balance";
require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerOrderServiceGet", () => {
  it("should return order with the correct lineitems for customer/groupId", async () => {
    const customerId = 7106990342471;
    const dumbData = Order.parse(orderWithfulfillmentAndRefunds);
    dumbData.line_items.map((lineItem) => {
      lineItem.properties!.customerId = customerId;
    });
    const order = await OrderModel.create(dumbData);
    const response = await CustomerPayoutServiceBalance({ customerId });
    console.log(JSON.stringify(response));
  });
});

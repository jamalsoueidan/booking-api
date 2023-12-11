import { OrderModel } from "~/functions/order/order.models";
import { Order } from "~/functions/order/order.types";
import { getOrderObject } from "~/library/jest/helpers/order";
import { CustomerOrderServicePaginate } from "./paginate";
require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerOrderServicePaginate", () => {
  it("should return orders for customer pagination", async () => {
    const customerId = 1;
    const dumbData = Order.parse(
      getOrderObject({ customerId, lineItemsTotal: 50 })
    );

    await OrderModel.create(dumbData);

    const orders = await CustomerOrderServicePaginate({
      customerId: customerId || 0,
    });

    console.log(orders);

    orders.results.forEach((p) => console.log(p.start));
  });
});

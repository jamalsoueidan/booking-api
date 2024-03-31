import { OrderModel } from "~/functions/order/order.models";
import { Order } from "~/functions/order/order.types";

import { faker } from "@faker-js/faker";
import { createPayoutAccount } from "~/library/jest/helpers/payout-account";
import { createShipping } from "~/library/jest/helpers/shipping";

import { CustomerPayoutServiceCreate } from "../payout/create";
import { dummyDataBalance } from "../payout/fixtures/dummydata.balance";
import { CustomerServicePayoutLogPaginate } from "./paginate";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerServicePayoutLogList", () => {
  const customerId = 7106990342471;

  beforeEach(async () => {
    const shipping = await createShipping({ origin: { customerId } });
    dummyDataBalance.id = faker.number.int({ min: 1000000, max: 100000000 });
    dummyDataBalance.line_items = dummyDataBalance.line_items.map(
      (lineItem) => {
        lineItem.current_quantity = 1;
        lineItem.fulfillable_quantity = 0;
        lineItem.fulfillment_status = "fulfilled";
        const price = faker.number.float({
          min: 100,
          max: 500,
        });
        lineItem.price = price.toFixed(2);
        lineItem.properties = [
          { name: "_from", value: "2023-12-14T08:12:00.000Z" },
          { name: "_to", value: "2023-12-14T09:27:00.000Z" },
          { name: "_customerId", value: customerId },
          { name: "_locationId", value: "64a6c1bde5df64bb85935732" },
          { name: "_shippingId", value: shipping._id.toString() },
        ] as any;
        lineItem.id = faker.number.int({ min: 1000000, max: 100000000 });
        return lineItem;
      }
    );

    await createPayoutAccount({ customerId });
    await OrderModel.create(Order.parse(dummyDataBalance));
  });

  it("should get payout with line-items", async () => {
    const payout = await CustomerPayoutServiceCreate({ customerId });

    const response = await CustomerServicePayoutLogPaginate({
      page: 1,
      customerId,
      payoutId: payout._id,
    });

    expect(response.results.length).toBe(3);
  });
});

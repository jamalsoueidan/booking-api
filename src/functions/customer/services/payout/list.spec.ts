import { OrderModel } from "~/functions/order/order.models";
import { Order } from "~/functions/order/order.types";

import { faker } from "@faker-js/faker";
import { createPayout } from "~/library/jest/helpers/payout";
import { createPayoutAccount } from "~/library/jest/helpers/payout-account";
import { createShipping } from "~/library/jest/helpers/shipping";
import { dummyDataBalance } from "./fixtures/dummydata.balance";
import { CustomerPayoutServiceList } from "./list";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerPayoutServiceList", () => {
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

    await OrderModel.create(Order.parse(dummyDataBalance));
  });

  it("create payouts to test pagination", async () => {
    const account = await createPayoutAccount({ customerId });

    await createPayout({
      customerId,
      payoutDetails: account.payoutDetails,
      payoutType: account.payoutType,
    });
    await createPayout({
      customerId,
      payoutDetails: account.payoutDetails,
      payoutType: account.payoutType,
    });
    await createPayout({
      customerId,
      payoutDetails: account.payoutDetails,
      payoutType: account.payoutType,
    });
    await createPayout({
      customerId,
      payoutDetails: account.payoutDetails,
      payoutType: account.payoutType,
    });

    let result = await CustomerPayoutServiceList({
      filter: { customerId },
    });
    expect(result.nextCursor).not.toBeDefined();
    expect(result.total).toBe(4);

    result = await CustomerPayoutServiceList({
      limit: 2,
      filter: { customerId },
    });
    expect(result.nextCursor).toBeDefined();

    result = await CustomerPayoutServiceList({
      limit: 2,
      nextCursor: result.nextCursor,
      filter: { customerId },
    });
    expect(result.nextCursor).not.toBeDefined();
  });
});

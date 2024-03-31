import { OrderModel } from "~/functions/order/order.models";
import { Order } from "~/functions/order/order.types";

import { faker } from "@faker-js/faker";
import { PayoutLogModel, PayoutLogReferenceType } from "~/functions/payout-log";
import { IShippingDocument } from "~/functions/shipping/shipping.schema";
import { createPayoutAccount } from "~/library/jest/helpers/payout-account";
import { createShipping } from "~/library/jest/helpers/shipping";
import {
  CustomerPayoutServiceCreate,
  CustomerPayoutServiceGetLineItemsFulfilled,
} from "./create";
import { dummyDataBalance } from "./fixtures/dummydata.balance";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerPayoutServiceCreate", () => {
  const customerId = 7106990342471;
  let shipping: IShippingDocument;

  beforeEach(async () => {
    shipping = await createShipping({ origin: { customerId } });
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

  it("should create payout and payoutlog", async () => {
    const lineItems = await CustomerPayoutServiceGetLineItemsFulfilled({
      customerId,
    });

    const totalAmount = lineItems.reduce(
      (accumulator, { line_items }) =>
        accumulator + parseFloat(line_items.price),
      0
    );

    const response = await CustomerPayoutServiceCreate({ customerId });
    expect(response.amount).toBe(totalAmount + shipping.cost.value);

    const payoutLogs = await PayoutLogModel.find({ payout: response._id });

    const lineItemIds = lineItems.map(({ line_items }) => line_items.id);
    const everyLineItemHasPayoutLog = lineItemIds.every((lineItemId) =>
      payoutLogs.some((payoutLog) => payoutLog.referenceId === lineItemId)
    );
    expect(everyLineItemHasPayoutLog).toBe(true);

    const shippingLogCount = await PayoutLogModel.countDocuments({
      referenceType: PayoutLogReferenceType.SHIPPING,
    });
    const lineItemLogCount = await PayoutLogModel.countDocuments({
      referenceType: PayoutLogReferenceType.LINE_ITEM,
    });

    expect(lineItemLogCount).toBe(lineItems.length);
    expect(shippingLogCount).toBe(1);
  });

  it("should not create another payout when there is no line-items fulfilled left", async () => {
    await CustomerPayoutServiceCreate({ customerId });
    await expect(CustomerPayoutServiceCreate({ customerId })).rejects.toThrow();
  });
});

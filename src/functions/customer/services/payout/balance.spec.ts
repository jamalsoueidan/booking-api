import { OrderModel } from "~/functions/order/order.models";
import { Order } from "~/functions/order/order.types";

import mongoose from "mongoose";
import { PayoutLogModel, PayoutLogReferenceType } from "~/functions/payout-log";
import { createShipping } from "~/library/jest/helpers/shipping";
import { CustomerPayoutServiceBalance } from "./balance";
import { dummyDataBalance } from "./fixtures/dummydata.balance";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerPayoutServiceBalance", () => {
  const customerId = 7106990342471;

  beforeEach(async () => {
    dummyDataBalance.line_items = await Promise.all(
      dummyDataBalance.line_items.map(async (lineItem) => {
        const shipping = await createShipping({ origin: { customerId } });
        lineItem.properties = [
          { name: "_from", value: "2023-12-14T08:12:00.000Z" },
          { name: "_to", value: "2023-12-14T09:27:00.000Z" },
          { name: "_customerId", value: customerId },
          { name: "_locationId", value: "64a6c1bde5df64bb85935732" },
          { name: "_shippingId", value: shipping._id.toString() },
        ] as any;
        return lineItem;
      })
    );
  });

  it("should return balance for all line-items", async () => {
    const dumbData = Order.parse(dummyDataBalance);
    await OrderModel.create(dumbData);
    const response = await CustomerPayoutServiceBalance({ customerId });
    expect(response).toBeGreaterThan(180);
  });

  it("should not repay shipping if already paid out", async () => {
    const shipping = await createShipping({ origin: { customerId } });
    dummyDataBalance.line_items = dummyDataBalance.line_items.map(
      (lineItem) => {
        lineItem.properties = [
          { name: "_from", value: "2023-12-14T08:12:00.000Z" },
          { name: "_to", value: "2023-12-14T09:27:00.000Z" },
          { name: "_customerId", value: customerId },
          { name: "_locationId", value: "64a6c1bde5df64bb85935732" },
          { name: "_shippingId", value: shipping._id.toString() },
        ] as any;
        return lineItem;
      }
    );

    await PayoutLogModel.create({
      customerId,
      referenceId: shipping._id,
      referenceType: PayoutLogReferenceType.SHIPPING,
      payout: new mongoose.Types.ObjectId(),
    });

    const dumbData = Order.parse(dummyDataBalance);
    await OrderModel.create(dumbData);
    const response = await CustomerPayoutServiceBalance({ customerId });
    expect(response).toBe(180);
  });

  it("should exclude balance that have been paid out", async () => {
    const dumbData = Order.parse(dummyDataBalance);
    await OrderModel.create(dumbData);

    await PayoutLogModel.create({
      customerId,
      referenceId: dumbData.line_items[0].id,
      referenceType: PayoutLogReferenceType.LINE_ITEM,
      payout: new mongoose.Types.ObjectId(),
    });

    const response = await CustomerPayoutServiceBalance({ customerId });
    expect(response).toBe(0);
  });

  it("should calculate all items that are fulfilled and not yet paid out", async () => {
    dummyDataBalance.line_items = dummyDataBalance.line_items.map((item) => {
      item.current_quantity = 1;
      item.fulfillable_quantity = 0;
      item.fulfillment_status = "fulfilled";
      return item;
    });

    const dumbData = Order.parse(dummyDataBalance);
    await OrderModel.create(dumbData);

    await PayoutLogModel.create({
      customerId,
      referenceId: dumbData.line_items[0].id,
      referenceType: PayoutLogReferenceType.LINE_ITEM,
      payout: new mongoose.Types.ObjectId(),
    });

    const response = await CustomerPayoutServiceBalance({ customerId });
    expect(response).toBeGreaterThan(300);
  });

  it("should return zero balance when orders is empty", async () => {
    const response = await CustomerPayoutServiceBalance({ customerId: 0 });
    expect(response).toBe(0);
  });
});

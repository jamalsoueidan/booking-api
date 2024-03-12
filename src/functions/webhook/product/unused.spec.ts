import { InvocationContext } from "@azure/functions";
import { Schedule, ScheduleModel } from "~/functions/schedule";
import { createContext } from "~/library/jest/azure";
import { getProductObject } from "~/library/jest/helpers/product";
import { productDumbData } from "./product.dumb";
import { ProductWebHookGetUnusedVariantIds } from "./unused";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("~/library/application-insight", () => ({
  telemetryClient: {
    trackException: jest.fn(),
  },
}));

describe("webhookUpdateProcess", () => {
  let context: InvocationContext = createContext();
  const schedule3: Omit<Schedule, "_id"> = {
    name: "schedula b",
    customerId: 1,
    slots: [
      {
        day: "monday",
        intervals: [
          {
            from: "15:00",
            to: "20:00",
          },
        ],
      },
    ],
    products: [
      getProductObject({
        productId: productDumbData.id, //correct
        variantId: productDumbData.variants[0].id, //correct
      }),
      getProductObject({
        productId: 1,
        variantId: 49207559356743,
      }),
    ],
  };

  const schedule4: Omit<Schedule, "_id"> = {
    name: "schedule a",
    customerId: 2,
    slots: [
      {
        day: "saturday",
        intervals: [
          {
            from: "17:00",
            to: "20:00",
          },
        ],
      },
    ],
    products: [
      getProductObject({
        productId: 1,
        variantId: 1,
      }),
      getProductObject({
        productId: productDumbData.id, //correct
        variantId: productDumbData.variants[1].id, //correct
      }),
    ],
  };

  beforeEach(async () => {
    await ScheduleModel.create(schedule3);
    await ScheduleModel.create(schedule4);
  });

  it("'should confirm that specific variant IDs are not in the array'", async () => {
    let unusedVariantIds = await ProductWebHookGetUnusedVariantIds({
      product: productDumbData,
    });
    const variantIdsToCheck = [
      productDumbData.variants[0].id,
      productDumbData.variants[1].id,
    ];
    variantIdsToCheck.forEach((id) => {
      expect(unusedVariantIds).not.toContain(id);
    });
  });
});

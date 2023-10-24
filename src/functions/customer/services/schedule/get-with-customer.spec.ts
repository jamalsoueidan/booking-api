import { NotFoundError } from "~/library/handler";
import { arrayElements, createUser } from "~/library/jest/helpers";
import { createSchedule } from "~/library/jest/helpers/schedule";
import { CustomerScheduleServiceGetWithCustomer } from "./get-with-customer";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerScheduleServiceGetWithCustomer", () => {
  const customerId = 123;
  const name = "Test Schedule";

  it("should return schedule with customer", async () => {
    await createUser({ customerId });

    // test with one known productId and one unknown
    const schedule1 = await createSchedule(
      {
        customerId,
      },
      {
        totalProducts: 3,
        days: ["monday", "tuesday"],
        locations: [],
      }
    );

    let productIds = arrayElements(
      schedule1.products.map((p) => p.productId),
      1
    );

    await expect(
      CustomerScheduleServiceGetWithCustomer({
        customerId,
        productIds: [...productIds, 1],
      })
    ).rejects.toThrow(NotFoundError);

    // test with real productIds
    const schedule2 = await createSchedule(
      {
        customerId,
      },
      {
        totalProducts: 3,
        days: ["wednesday", "thursday"],
        locations: [],
      }
    );

    productIds = arrayElements(
      schedule2.products.map((p) => p.productId),
      2
    );

    const schedule = await CustomerScheduleServiceGetWithCustomer({
      customerId,
      productIds,
    });

    schedule.products.forEach((product) => {
      expect(productIds).toContain(product.productId);
    });
  });
});

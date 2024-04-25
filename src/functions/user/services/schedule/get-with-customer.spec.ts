import { SlotWeekDays } from "~/functions/schedule";
import { NotFoundError } from "~/library/handler";
import { arrayElements, createUser } from "~/library/jest/helpers";
import { getDumbLocationObject } from "~/library/jest/helpers/location";
import { createSchedule } from "~/library/jest/helpers/schedule";
import { UserScheduleServiceGetWithCustomer } from "./get-with-customer";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserScheduleServiceGetWithCustomer", () => {
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
        days: [SlotWeekDays.MONDAY, SlotWeekDays.TUESDAY],
        locations: [getDumbLocationObject()],
      }
    );

    let productIds = arrayElements(
      schedule1.products.map((p) => p.productId),
      1
    );

    await expect(
      UserScheduleServiceGetWithCustomer({
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
        days: [SlotWeekDays.WEDNESDAY, SlotWeekDays.THURSDAY],
        locations: [getDumbLocationObject()],
      }
    );

    productIds = arrayElements(
      schedule2.products.map((p) => p.productId),
      2
    );

    const schedule = await UserScheduleServiceGetWithCustomer({
      customerId,
      productIds,
    });

    schedule.products.forEach((product) => {
      expect(productIds).toContain(product.productId);
    });
  });
});

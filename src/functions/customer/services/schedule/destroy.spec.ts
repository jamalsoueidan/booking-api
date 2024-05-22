import { createSchedule } from "~/library/jest/helpers/schedule";
import { CustomerScheduleServiceDestroy } from "./destroy";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerScheduleServiceDestroy", () => {
  const customerId = 123;
  const name = "Test Schedule";

  it("should delete an existing schedule", async () => {
    const newSchedule = await createSchedule({
      name,
      customerId,
    });
    const deleteResult = await CustomerScheduleServiceDestroy({
      scheduleId: newSchedule._id,
      customerId: newSchedule.customerId,
    });

    expect(deleteResult.deletedCount).toEqual(1);
  });
});

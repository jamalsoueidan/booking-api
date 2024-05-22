import { NotFoundError } from "~/library/handler";
import { createSchedule } from "~/library/jest/helpers/schedule";
import { CustomerScheduleServiceGet } from "./get";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerScheduleServiceGet", () => {
  const customerId = 123;
  const name = "Test Schedule";

  it("should return a specific schedule", async () => {
    const newSchedule = await createSchedule({
      name,
      customerId,
    });
    const retrievedSchedule = await CustomerScheduleServiceGet({
      scheduleId: newSchedule._id,
      customerId: newSchedule.customerId,
    });

    expect(retrievedSchedule._id.toString()).toEqual(
      newSchedule._id.toString()
    );
  });

  it("should throw NotFoundError when trying to get schedule that is not found", async () => {
    const newSchedule = await createSchedule({
      name,
      customerId,
    });
    await expect(
      CustomerScheduleServiceGet({ scheduleId: newSchedule._id, customerId: 0 })
    ).rejects.toThrow(NotFoundError);
  });
});

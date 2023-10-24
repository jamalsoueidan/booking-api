import { NotFoundError } from "~/library/handler";
import { CustomerScheduleServiceCreate } from "./create";
import { CustomerScheduleServiceUpdate } from "./update";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerScheduleServiceUpdate", () => {
  const customerId = 123;
  const name = "Test Schedule";

  it("should update schedule", async () => {
    const newSchedule = await CustomerScheduleServiceCreate({
      name,
      customerId,
    });
    const updatedScheduleName = "Updated Test Schedule";

    const updatedSchedule = await CustomerScheduleServiceUpdate(
      {
        scheduleId: newSchedule._id,
        customerId: newSchedule.customerId,
      },
      {
        name: updatedScheduleName,
      }
    );
    expect(updatedSchedule).toMatchObject({
      name: updatedScheduleName,
    });
  });

  it("should throw NotFoundError when trying to update schedule that is not found", async () => {
    const newSchedule = await CustomerScheduleServiceCreate({
      name,
      customerId,
    });
    const updatedScheduleName = "Updated Test Schedule";

    await expect(
      CustomerScheduleServiceUpdate(
        { scheduleId: newSchedule._id, customerId: 0 },
        {
          name: updatedScheduleName,
        }
      )
    ).rejects.toThrow(NotFoundError);
  });
});

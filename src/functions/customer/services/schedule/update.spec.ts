import { ScheduleModel } from "~/functions/schedule";
import { NotFoundError } from "~/library/handler";
import { CustomerScheduleServiceUpdate } from "./update";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerScheduleServiceUpdate", () => {
  const customerId = 123;
  const name = "Test Schedule";

  it("should update schedule", async () => {
    const newSchedule = new ScheduleModel({
      name,
      customerId,
      metafieldId: "gid://shopify/Metaobject/77850968391",
      slots: [
        {
          day: "monday",
          intervals: [
            {
              from: "08:00",
              to: "16:00",
            },
          ],
        },
      ],
    });
    await newSchedule.save();

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
    const newSchedule = new ScheduleModel({
      name,
      customerId,
      metafieldId: "gid://shopify/Metaobject/77850968391",
      slots: [
        {
          day: "monday",
          intervals: [
            {
              from: "08:00",
              to: "16:00",
            },
          ],
        },
      ],
    });
    await newSchedule.save();

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

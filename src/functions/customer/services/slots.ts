import { Schedule, ScheduleModel, ScheduleSlot } from "~/functions/schedule";
import { NotFoundError } from "~/library/handler";

export type CustomerScheduleSlotServiceUpdateFilter = {
  scheduleId: Schedule["_id"];
  customerId: Schedule["customerId"];
};

export type CustomerScheduleSlotServiceUpdateBody = ScheduleSlot[];

export const CustomerScheduleSlotServiceUpdate = async (
  filter: CustomerScheduleSlotServiceUpdateFilter,
  updatedSlot: CustomerScheduleSlotServiceUpdateBody
) => {
  try {
    const schedule = await ScheduleModel.findOne({
      _id: filter.scheduleId,
      customerId: filter.customerId,
    }).orFail(
      new NotFoundError([
        {
          code: "custom",
          message: "SCHEDULE_NOT_FOUND",
          path: ["schedule"],
        },
      ])
    );

    if (!schedule) {
      throw new Error("Schedule not found");
    }

    return schedule.updateSlots(updatedSlot);
  } catch (error) {
    console.error("Error updating slot:", error);
  }
};

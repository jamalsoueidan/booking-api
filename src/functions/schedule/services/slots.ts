import { NotFoundError } from "~/library/handler";
import { ScheduleModel } from "../schedule.model";
import { Schedule, ScheduleSlot } from "../schedule.types";

export type ScheduleSlotServiceUpdateFilter = {
  scheduleId: Schedule["_id"];
  customerId: Schedule["customerId"];
};

export type ScheduleSlotServiceUpdateBody = ScheduleSlot[];

export const ScheduleSlotServiceUpdate = async (
  filter: ScheduleSlotServiceUpdateFilter,
  updatedSlot: ScheduleSlotServiceUpdateBody
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

import { NotFoundError } from "~/library/handler";
import { ScheduleModel } from "../schedule.model";
import { Schedule, ScheduleSlot } from "../schedule.types";

export type ScheduleServiceUpdateSlotFilter = {
  scheduleId: Schedule["_id"];
  customerId: Schedule["customerId"];
};

export type ScheduleServiceUpdateSlotBody = ScheduleSlot[];

export const ScheduleServiceUpdateSlot = async (
  filter: ScheduleServiceUpdateSlotFilter,
  updatedSlot: ScheduleServiceUpdateSlotBody
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

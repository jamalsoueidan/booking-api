import { Schedule, ScheduleModel } from "~/functions/schedule";
import { NotFoundError } from "~/library/handler";

export type ScheduleServiceUpdateProps = {
  scheduleId: Schedule["_id"];
  customerId: Schedule["customerId"];
};

export type CustomerScheduleServiceUpdateBody = Pick<Schedule, "name">;

export const CustomerScheduleServiceUpdate = async (
  filter: ScheduleServiceUpdateProps,
  body: CustomerScheduleServiceUpdateBody
) => {
  return ScheduleModel.findOneAndUpdate(
    { _id: filter.scheduleId, customerId: filter.customerId },
    body,
    {
      new: true,
    }
  ).orFail(
    new NotFoundError([
      {
        code: "custom",
        message: "SCHEDULE_NOT_FOUND",
        path: ["schedule"],
      },
    ])
  );
};

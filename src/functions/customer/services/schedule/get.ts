import { Schedule, ScheduleModel } from "~/functions/schedule";
import { NotFoundError } from "~/library/handler";

export type CustomerScheduleServiceGetProps = {
  scheduleId: Schedule["_id"];
  customerId: Schedule["customerId"];
};

export const CustomerScheduleServiceGet = async (
  filter: CustomerScheduleServiceGetProps
) => {
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

  return schedule;
};

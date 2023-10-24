import { Schedule, ScheduleModel } from "~/functions/schedule";

export type CustomerScheduleServiceDestroyProps = {
  scheduleId: Schedule["_id"];
  customerId: Schedule["customerId"];
};

export const CustomerScheduleServiceDestroy = async (
  props: CustomerScheduleServiceDestroyProps
) => {
  return ScheduleModel.deleteOne({
    _id: props.scheduleId,
    customerId: props.customerId,
  });
};

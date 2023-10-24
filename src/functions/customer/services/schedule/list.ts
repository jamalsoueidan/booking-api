import { Schedule, ScheduleModel } from "~/functions/schedule";

export type CustomerScheduleServiceListProps = Pick<Schedule, "customerId">;

export const CustomerScheduleServiceList = async (
  filter: CustomerScheduleServiceListProps
) => {
  return ScheduleModel.find(filter).sort("created_at").lean();
};

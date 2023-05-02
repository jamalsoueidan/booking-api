import { NotFoundError } from "~/library/handler";
import { ScheduleModel } from "./schedule.model";
import { Schedule } from "./schedule.types";

type Create = Pick<Schedule, "name" | "customerId">;
type Destroy = Pick<Schedule, "_id" | "customerId">;
type Update = Pick<Schedule, "_id" | "customerId">;
type List = Pick<Schedule, "customerId">;
type Get = Pick<Schedule, "_id" | "customerId">;

export const ScheduleServiceCreate = async (props: Create) => {
  const newSchedule = new ScheduleModel(props);
  return newSchedule.save();
};

export const ScheduleServiceDestroy = async (props: Destroy) => {
  return ScheduleModel.deleteOne(props);
};

export const ScheduleServiceUpdate = async (
  filter: Update,
  scheduleData: Partial<Schedule>
) => {
  const updatedSchedule = await ScheduleModel.findOneAndUpdate(
    filter,
    scheduleData,
    { new: true }
  )
    .lean()
    .orFail(
      new NotFoundError([
        {
          code: "custom",
          message: "SCHEDULE_NOT_FOUND",
          path: ["schedule"],
        },
      ])
    );

  return updatedSchedule;
};

export const ScheduleServiceList = async (filter: List) => {
  return ScheduleModel.find(filter).lean();
};

export const ScheduleServiceGet = async (props: Get) => {
  const schedule = await ScheduleModel.findOne(props)
    .lean()
    .orFail(
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

import { NotFoundError } from "~/library/handler";
import { ScheduleModel } from "./schedule.model";
import { Schedule } from "./schedule.types";

type Create = Pick<Schedule, "name" | "customerId">;

export const ScheduleServiceCreate = async (props: Create) => {
  const newSchedule = new ScheduleModel(props);
  return newSchedule.save();
};

export const ScheduleServiceDestroy = async (props: Create) => {
  return ScheduleModel.deleteOne(props);
};

export const ScheduleServiceUpdate = async (
  filter: Create,
  scheduleData: Partial<Schedule>
) => {
  const updatedSchedule = await ScheduleModel.findOneAndUpdate(
    filter,
    scheduleData,
    { new: true }
  ).orFail(
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

export const ScheduleServiceList = async (
  customerId: Schedule["customerId"]
) => {
  return ScheduleModel.find({ customerId });
};

export const ScheduleServiceGet = async (props: Create) => {
  const schedule = await ScheduleModel.findOne(props).orFail(
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

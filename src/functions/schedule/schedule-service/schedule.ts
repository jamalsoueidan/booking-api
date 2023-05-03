import { NotFoundError } from "~/library/handler";
import { ScheduleModel } from "../schedule.model";
import { Schedule } from "../schedule.types";

type ScheduleServiceCreateBody = Pick<Schedule, "name" | "customerId">;

export const ScheduleServiceCreate = async (
  props: ScheduleServiceCreateBody
) => {
  const newSchedule = new ScheduleModel(props);
  return newSchedule.save();
};

type ScheduleServiceDestroyProps = {
  scheduleId: Schedule["_id"];
  customerId: Schedule["customerId"];
};

export const ScheduleServiceDestroy = async (
  props: ScheduleServiceDestroyProps
) => {
  return ScheduleModel.deleteOne({
    _id: props.scheduleId,
    customerId: props.customerId,
  });
};

type ScheduleServiceUpdateProps = {
  scheduleId: Schedule["_id"];
  customerId: Schedule["customerId"];
};

type ScheduleServiceUpdateBody = Pick<Schedule, "name">;

export const ScheduleServiceUpdate = async (
  filter: ScheduleServiceUpdateProps,
  body: ScheduleServiceUpdateBody
) => {
  const updatedSchedule = await ScheduleModel.findOneAndUpdate(filter, body, {
    new: true,
  }).orFail(
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

type ScheduleServiceListProps = Pick<Schedule, "customerId">;

export const ScheduleServiceList = async (filter: ScheduleServiceListProps) => {
  return ScheduleModel.find(filter).lean();
};

type ScheduleServiceGetProps = {
  scheduleId: Schedule["_id"];
  customerId: Schedule["customerId"];
};

export const ScheduleServiceGet = async (props: ScheduleServiceGetProps) => {
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

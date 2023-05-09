import { NotFoundError } from "~/library/handler";
import { ScheduleModel } from "../schedule.model";
import { Schedule } from "../schedule.types";

type ScheduleServiceCreateBody = Pick<Schedule, "name" | "customerId">;

export const ScheduleServiceCreate = async (
  props: ScheduleServiceCreateBody
) => {
  const newSchedule = new ScheduleModel({
    ...props,
    slots: [
      {
        day: "monday",
        intervals: [
          {
            from: "8:00",
            to: "16:00",
          },
        ],
      },
    ],
  });
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
  const updatedSchedule = await ScheduleModel.findOneAndUpdate(
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

  return updatedSchedule;
};

type ScheduleServiceListProps = Pick<Schedule, "customerId">;

export const ScheduleServiceList = async (filter: ScheduleServiceListProps) => {
  const count = await ScheduleModel.count(filter).lean();
  if (count === 0) {
    await ScheduleServiceCreate({
      name: "DEFAULT",
      customerId: filter.customerId,
    });
  }
  return ScheduleModel.find(filter).sort("created_at").lean();
};

type ScheduleServiceGetProps = {
  scheduleId: Schedule["_id"];
  customerId: Schedule["customerId"];
};

export const ScheduleServiceGet = async (filter: ScheduleServiceGetProps) => {
  const schedule = await ScheduleModel.findOne({
    _id: filter.scheduleId,
    customerId: filter.customerId,
  })
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

import { Schedule, ScheduleModel } from "~/functions/schedule";
import { NotFoundError } from "~/library/handler";

type CustomerScheduleServiceCreateBody = Pick<Schedule, "name" | "customerId"> &
  Pick<Partial<Schedule>, "products">;

export const CustomerScheduleServiceCreate = async (
  props: CustomerScheduleServiceCreateBody
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

type CustomerScheduleServiceDestroyProps = {
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

type ScheduleServiceUpdateProps = {
  scheduleId: Schedule["_id"];
  customerId: Schedule["customerId"];
};

type CustomerScheduleServiceUpdateBody = Pick<Schedule, "name">;

export const CustomerScheduleServiceUpdate = async (
  filter: ScheduleServiceUpdateProps,
  body: CustomerScheduleServiceUpdateBody
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

type CustomerScheduleServiceListProps = Pick<Schedule, "customerId">;

export const CustomerScheduleServiceList = async (
  filter: CustomerScheduleServiceListProps
) => {
  return ScheduleModel.find(filter).sort("created_at").lean();
};

type CustomerScheduleServiceGetProps = {
  scheduleId: Schedule["_id"];
  customerId: Schedule["customerId"];
};

export const CustomerScheduleServiceGet = async (
  filter: CustomerScheduleServiceGetProps
) => {
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

import { Schedule, ScheduleModel } from "~/functions/schedule";

export type CustomerScheduleServiceCreateBody = Pick<
  Schedule,
  "name" | "customerId"
> &
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
            from: "08:00",
            to: "16:00",
          },
        ],
      },
    ],
  });
  return newSchedule.save();
};

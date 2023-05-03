import { z } from "zod";
import { ScheduleServiceList } from "~/functions/schedule/schedule-service/schedule";
import { ScheduleZodSchema } from "~/functions/schedule/schedule.types";
import { _ } from "~/library/handler";

export type ScheduleControllerListRequest = {
  query: z.infer<typeof ScheduleControllerListQuerySchema>;
};

const ScheduleControllerListQuerySchema = ScheduleZodSchema.pick({
  customerId: true,
});

export type ScheduleControllerListResponse = Awaited<
  ReturnType<typeof ScheduleServiceList>
>;

export const ScheduleControllerList = _(
  ({ query }: ScheduleControllerListRequest) => {
    const validateQuery = ScheduleControllerListQuerySchema.parse(query);
    return ScheduleServiceList(validateQuery);
  }
);

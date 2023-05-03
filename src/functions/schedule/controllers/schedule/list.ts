import { z } from "zod";
import { ScheduleZodSchema } from "~/functions/schedule/schedule.types";
import { ScheduleServiceList } from "~/functions/schedule/services";
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

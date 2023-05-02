import { z } from "zod";
import { _ } from "~/library/handler";
import { ScheduleServiceList } from "../schedule.service";
import { ScheduleZodSchema } from "../schedule.types";

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

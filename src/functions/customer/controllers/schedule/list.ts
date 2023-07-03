import { z } from "zod";
import { ScheduleServiceList } from "~/functions/customer/services";
import { ScheduleZodSchema } from "~/functions/schedule/schedule.types";
import { _ } from "~/library/handler";
import { BooleanOrStringType } from "~/library/zod";

export type ScheduleControllerListRequest = {
  query: z.infer<typeof ScheduleControllerListQuerySchema>;
};

const ScheduleControllerListQuerySchema = ScheduleZodSchema.pick({
  customerId: true,
}).extend({
  productsExist: BooleanOrStringType,
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

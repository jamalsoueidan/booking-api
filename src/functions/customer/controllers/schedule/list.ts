import { z } from "zod";
import { CustomerScheduleServiceList } from "~/functions/customer/services";
import { ScheduleZodSchema } from "~/functions/schedule/schedule.types";
import { _ } from "~/library/handler";
import { BooleanOrStringType } from "~/library/zod";

export type CustomerScheduleControllerListRequest = {
  query: z.infer<typeof CustomerScheduleControllerListQuerySchema>;
};

const CustomerScheduleControllerListQuerySchema = ScheduleZodSchema.pick({
  customerId: true,
}).extend({
  productsExist: BooleanOrStringType,
});

export type CustomerScheduleControllerListResponse = Awaited<
  ReturnType<typeof CustomerScheduleServiceList>
>;

export const CustomerScheduleControllerList = _(
  ({ query }: CustomerScheduleControllerListRequest) => {
    const validateQuery =
      CustomerScheduleControllerListQuerySchema.parse(query);
    return CustomerScheduleServiceList(validateQuery);
  }
);

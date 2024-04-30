import { z } from "zod";
import { ScheduleProductZodSchema } from "~/functions/schedule/schedule.types";

import { _ } from "~/library/handler";
import { GidFormat, StringOrObjectId } from "~/library/zod";
import { CustomerProductServiceAdd } from "../../services/product/add";
import { CustomerProductServiceUpdate } from "../../services/product/update";

export type CustomerProductControllerAddRequest = {
  query: z.infer<typeof CustomerProductControllerAddQuerySchema>;
  body: z.infer<typeof CustomerProductControllerAddBodySchema>;
};

const CustomerProductControllerAddQuerySchema = z.object({
  customerId: GidFormat,
});

const CustomerProductControllerAddBodySchema = ScheduleProductZodSchema.omit({
  description: true,
  duration: true,
  bookingPeriod: true,
  breakTime: true,
  noticePeriod: true,
})
  .extend({
    scheduleId: StringOrObjectId,
  })
  .strip();

export type CustomerProductControllerAddResponse = Awaited<
  ReturnType<typeof CustomerProductServiceUpdate>
>;

export const CustomerProductControllerAdd = _(
  ({ query, body }: CustomerProductControllerAddRequest) => {
    const validateQuery = CustomerProductControllerAddQuerySchema.parse(query);
    const validateBody = CustomerProductControllerAddBodySchema.parse(body);

    return CustomerProductServiceAdd(validateQuery, validateBody);
  }
);

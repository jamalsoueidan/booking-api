import { z } from "zod";

import { ScheduleProductZodSchema } from "~/functions/schedule";
import { _ } from "~/library/handler";
import { GidFormat, StringOrObjectId } from "~/library/zod";
import { CustomerProductServiceAdd } from "../../services/product/add";

export type CustomerProductControllerAddRequest = {
  query: z.infer<typeof CustomerProductControllerAddQuerySchema>;
  body: z.infer<typeof CustomerProductControllerAddBodySchema>;
};

const CustomerProductControllerAddQuerySchema = z.object({
  customerId: GidFormat,
});

const CustomerProductControllerAddBodySchema = ScheduleProductZodSchema.pick({
  parentId: true,
  locations: true,
  price: true,
  compareAtPrice: true,
  hideFromCombine: true,
  hideFromProfile: true,
  description: true,
})
  .extend({
    scheduleId: StringOrObjectId,
    title: z.string(),
  })
  .strip();

export type CustomerProductControllerAddResponse = Awaited<
  ReturnType<typeof CustomerProductServiceAdd>
>;

export const CustomerProductControllerAdd = _(
  ({ query, body }: CustomerProductControllerAddRequest) => {
    const validateQuery = CustomerProductControllerAddQuerySchema.parse(query);
    const validateBody = CustomerProductControllerAddBodySchema.parse(body);

    return CustomerProductServiceAdd(validateQuery, validateBody);
  }
);

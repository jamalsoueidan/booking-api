import { z } from "zod";
import { ScheduleProductZodSchema } from "~/functions/schedule/schedule.types";

import { _ } from "~/library/handler";
import { GidFormat } from "~/library/zod";
import { CustomerProductServiceUpdate } from "../../services/product/update";

export type CustomerProductControllerUpdateRequest = {
  query: z.infer<typeof CustomerProductControllerUpdateQuerySchema>;
  body: z.infer<typeof CustomerProductControllerUpdateBodySchema>;
};

const CustomerProductControllerUpdateQuerySchema = z.object({
  customerId: GidFormat,
  productId: GidFormat,
});

const CustomerProductControllerUpdateBodySchema = ScheduleProductZodSchema.omit(
  {
    productId: true,
    productHandle: true,
  }
)
  .partial()
  .strip();

export type CustomerProductControllerUpdateResponse = Awaited<
  ReturnType<typeof CustomerProductServiceUpdate>
>;

export const CustomerProductControllerUpdate = _(
  ({ query, body }: CustomerProductControllerUpdateRequest) => {
    const validateQuery =
      CustomerProductControllerUpdateQuerySchema.parse(query);
    const validateBody = CustomerProductControllerUpdateBodySchema.parse(body);

    return CustomerProductServiceUpdate(validateQuery, validateBody);
  }
);

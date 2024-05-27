import { z } from "zod";
import { ScheduleProductZodSchema } from "~/functions/schedule/schedule.types";

import { InvocationContext } from "@azure/functions";
import { _ } from "~/library/handler";
import { GidFormat } from "~/library/zod";
import { CustomerProductUpdateOrchestration } from "../../orchestrations/product/update";
import { CustomerProductServiceUpdate } from "../../services/product/update";

export type CustomerProductControllerUpdateRequest = {
  query: z.infer<typeof CustomerProductControllerUpdateQuerySchema>;
  body: z.infer<typeof CustomerProductControllerUpdateBodySchema>;
  context: InvocationContext;
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
  async ({ query, body, context }: CustomerProductControllerUpdateRequest) => {
    const validateQuery =
      CustomerProductControllerUpdateQuerySchema.parse(query);
    const validateBody = CustomerProductControllerUpdateBodySchema.parse(body);

    const response = await CustomerProductServiceUpdate(
      validateQuery,
      validateBody
    );

    await CustomerProductUpdateOrchestration(query, context);

    return response;
  }
);

import { InvocationContext } from "@azure/functions";
import { z } from "zod";
import {
  ScheduleProductZodSchema,
  ScheduleZodSchema,
} from "~/functions/schedule/schedule.types";
import { _ } from "~/library/handler";
import { CustomerProductDestroyOrchestration } from "../../orchestrations/product/destroy";
import { CustomerProductServiceDestroy } from "../../services/product/destroy";
import { CustomerProductServiceGet } from "../../services/product/get";

export type CustomerProductControllerDestroyRequest = {
  query: z.infer<typeof CustomerProductControllerDestroyQuerySchema>;
  context: InvocationContext;
};

const CustomerProductControllerDestroyQuerySchema = z.object({
  customerId: ScheduleZodSchema.shape.customerId,
  productId: ScheduleProductZodSchema.shape.productId,
});

export type CustomerProductControllerDestroyResponse = Awaited<
  ReturnType<typeof CustomerProductServiceDestroy>
>;

export const CustomerProductControllerDestroy = _(
  async ({ query, context }: CustomerProductControllerDestroyRequest) => {
    const validateQuery =
      CustomerProductControllerDestroyQuerySchema.parse(query);

    // we must find the product before throwing it to durable function, since destroy may delete the product before
    // we can get hold of the product.options in the durable activate functions.
    const product = await CustomerProductServiceGet(validateQuery);
    await CustomerProductDestroyOrchestration(
      { product, customerId: validateQuery.customerId },
      context
    );

    return CustomerProductServiceDestroy(validateQuery);
  }
);

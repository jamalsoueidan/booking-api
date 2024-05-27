import { z } from "zod";

import { InvocationContext } from "@azure/functions";
import { ScheduleProductZodSchema } from "~/functions/schedule";
import { _ } from "~/library/handler";
import { GidFormat, StringOrObjectId } from "~/library/zod";
import { CustomerProductUpdateOrchestration } from "../../orchestrations/product/update";
import { CustomerProductServiceAdd } from "../../services/product/add";

export type CustomerProductControllerAddRequest = {
  query: z.infer<typeof CustomerProductControllerAddQuerySchema>;
  body: z.infer<typeof CustomerProductControllerAddBodySchema>;
  context: InvocationContext;
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
  descriptionHtml: true,
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
  async ({ query, body, context }: CustomerProductControllerAddRequest) => {
    const validateQuery = CustomerProductControllerAddQuerySchema.parse(query);
    const validateBody = CustomerProductControllerAddBodySchema.parse(body);

    const product = await CustomerProductServiceAdd(
      validateQuery,
      validateBody
    );

    await CustomerProductUpdateOrchestration(
      { productId: product.productId, customerId: query.customerId },
      context
    );

    return product;
  }
);

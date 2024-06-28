import { z } from "zod";

import { HttpRequest, InvocationContext } from "@azure/functions";
import { ScheduleProductZodSchema } from "~/functions/schedule";
import { _ } from "~/library/handler";
import { GidFormat, StringOrObjectId } from "~/library/zod";
import { CustomerProductAddOrchestration } from "../../orchestrations/product/add";
import { CustomerProductServiceAdd } from "../../services/product/add";

export type CustomerProductControllerAddRequest = {
  query: z.infer<typeof CustomerProductControllerAddQuerySchema>;
  body: z.infer<typeof CustomerProductControllerAddBodySchema>;
  request: HttpRequest;
  context: InvocationContext;
};

const CustomerProductControllerAddQuerySchema = z.object({
  customerId: GidFormat,
});

const CustomerProductControllerAddBodySchema = ScheduleProductZodSchema.pick({
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

    await CustomerProductAddOrchestration(
      { productId: product.productId, customerId: validateQuery.customerId },
      context
    );

    return product;
  }
);

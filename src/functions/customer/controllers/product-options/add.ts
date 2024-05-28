import { z } from "zod";

import { InvocationContext } from "@azure/functions";
import { _ } from "~/library/handler";
import { GidFormat } from "~/library/zod";
import { CustomerProductOptionsAddOrchestration } from "../../orchestrations/product-options/add";
import { CustomerProductOptionsServiceAdd } from "../../services/product-options/add";

export type CustomerProductOptionsControllerAddRequest = {
  query: z.infer<typeof CustomerProductOptionsControllerAddSchema>;
  body: z.infer<typeof CustomerProductOptionsControllerAddBodySchema>;
  context: InvocationContext;
};

const CustomerProductOptionsControllerAddSchema = z.object({
  customerId: GidFormat,
  productId: GidFormat, // add option to this productId
});

const CustomerProductOptionsControllerAddBodySchema = z.object({
  cloneId: GidFormat, // which productId to clone from shopify
  title: z.string(),
});

export const CustomerProductOptionsControllerAdd = _(
  async ({
    query,
    body,
    context,
  }: CustomerProductOptionsControllerAddRequest) => {
    const validateQuery =
      CustomerProductOptionsControllerAddSchema.parse(query);
    const validateBody =
      CustomerProductOptionsControllerAddBodySchema.parse(body);

    const productOption = await CustomerProductOptionsServiceAdd({
      ...validateQuery,
      ...validateBody,
    });

    await CustomerProductOptionsAddOrchestration(
      { productOptionId: productOption.productId, ...validateQuery },
      context
    );

    return context;
  }
);

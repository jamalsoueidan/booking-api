import { z } from "zod";

import { InvocationContext } from "@azure/functions";
import { _ } from "~/library/handler";
import { GidFormat } from "~/library/zod";
import { CustomerProductOptionsDestroyOrchestration } from "../../orchestrations/product-options/destroy";
import { CustomerProductOptionsServiceDestroy } from "../../services/product-options/destroy";

export type CustomerProductOptionsControllerDestroyRequest = {
  query: z.infer<typeof CustomerProductOptionsControllerDestroySchema>;
  context: InvocationContext;
};

const CustomerProductOptionsControllerDestroySchema = z.object({
  customerId: GidFormat,
  productId: GidFormat, // add option to this productId
  optionProductId: GidFormat, // which productId to clone from shopify
});

export const CustomerProductOptionsControllerDestroy = _(
  async ({
    query,
    context,
  }: CustomerProductOptionsControllerDestroyRequest) => {
    const validateQuery =
      CustomerProductOptionsControllerDestroySchema.parse(query);

    await CustomerProductOptionsDestroyOrchestration(
      { productOptionId: validateQuery.optionProductId },
      context
    );

    return CustomerProductOptionsServiceDestroy(validateQuery);
  }
);

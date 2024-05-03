import { z } from "zod";

import { _ } from "~/library/handler";
import { GidFormat } from "~/library/zod";
import { CustomerProductOptionsServiceDestroy } from "../../services/product-options/destroy";

export type CustomerProductOptionsControllerDestroyRequest = {
  query: z.infer<typeof CustomerProductOptionsControllerDestroySchema>;
};

const CustomerProductOptionsControllerDestroySchema = z.object({
  customerId: GidFormat,
  productId: GidFormat, // add option to this productId
  optionProductId: GidFormat, // which productId to clone from shopify
});

export const CustomerProductOptionsControllerDestroy = _(
  ({ query }: CustomerProductOptionsControllerDestroyRequest) => {
    const validateQuery =
      CustomerProductOptionsControllerDestroySchema.parse(query);

    return CustomerProductOptionsServiceDestroy(validateQuery);
  }
);

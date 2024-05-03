import { z } from "zod";

import { _ } from "~/library/handler";
import { GidFormat } from "~/library/zod";
import { CustomerProductOptionsServiceAdd } from "../../services/product-options/add";

export type CustomerProductOptionsControllerAddRequest = {
  query: z.infer<typeof CustomerProductOptionsControllerAddSchema>;
  body: z.infer<typeof CustomerProductOptionsControllerAddBodySchema>;
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
  ({ query, body }: CustomerProductOptionsControllerAddRequest) => {
    const validateQuery =
      CustomerProductOptionsControllerAddSchema.parse(query);
    const validateBody =
      CustomerProductOptionsControllerAddBodySchema.parse(body);

    return CustomerProductOptionsServiceAdd({
      ...validateQuery,
      ...validateBody,
    });
  }
);

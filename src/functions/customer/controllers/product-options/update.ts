import { z } from "zod";

import { _ } from "~/library/handler";
import { GidFormat, NumberOrString } from "~/library/zod";
import { CustomerProductOptionsServiceUpdate } from "../../services/product-options/update";

export type CustomerProductOptionsControllerUpdateRequest = {
  query: z.infer<typeof CustomerProductOptionsControllerUpdateQuerySchema>;
  body: z.infer<typeof CustomerProductOptionsControllerUpdateBodySchema>;
};

const CustomerProductOptionsControllerUpdateQuerySchema = z.object({
  customerId: GidFormat,
  productId: GidFormat, // add option to this productId
  optionProductId: GidFormat, // which productId to clone from shopify
});

const CustomerProductOptionsControllerUpdateBodySchema = z.array(
  z.object({
    id: GidFormat,
    price: NumberOrString,
    duration: NumberOrString, // which productId to clone from shopify
  })
);

export const CustomerProductOptionsControllerUpdate = _(
  ({ query, body }: CustomerProductOptionsControllerUpdateRequest) => {
    const validateQuery =
      CustomerProductOptionsControllerUpdateQuerySchema.parse(query);
    const validateBody =
      CustomerProductOptionsControllerUpdateBodySchema.parse(body);
    return CustomerProductOptionsServiceUpdate(validateQuery, validateBody);
  }
);

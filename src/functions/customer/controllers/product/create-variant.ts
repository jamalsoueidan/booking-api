import { z } from "zod";
import {
  ScheduleProductZodSchema,
  ScheduleZodSchema,
} from "~/functions/schedule/schedule.types";

import { _ } from "~/library/handler";
import { NumberOrStringType } from "~/library/zod";
import { CustomerProductServiceCreateVariant } from "../../services/product/create-variant";

export type CustomerProductControllerCreateVariantRequest = {
  query: z.infer<typeof CustomerProductControllerCreateVariantQuerySchema>;
  body: z.infer<typeof CustomerProductControllerCreateVariantBodySchema>;
};

const CustomerProductControllerCreateVariantQuerySchema = z.object({
  customerId: ScheduleZodSchema.shape.customerId,
  productId: ScheduleProductZodSchema.shape.productId,
});

const CustomerProductControllerCreateVariantBodySchema = z.object({
  price: NumberOrStringType,
  compareAtPrice: NumberOrStringType,
});

export type CustomerProductControllerCreateVariantResponse = Awaited<
  ReturnType<typeof CustomerProductServiceCreateVariant>
>;

export const CustomerProductControllerCreateVariant = _(
  ({ query, body }: CustomerProductControllerCreateVariantRequest) => {
    const validateQuery =
      CustomerProductControllerCreateVariantQuerySchema.parse(query);
    const validateBody =
      CustomerProductControllerCreateVariantBodySchema.parse(body);

    return CustomerProductServiceCreateVariant({
      ...validateQuery,
      ...validateBody,
    });
  }
);

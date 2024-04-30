import { _ } from "~/library/handler";

import { z } from "zod";
import { NumberOrString, StringOrObjectId } from "~/library/zod";
import { ShippingServiceCalculate } from "../services/calculate";
import { ShippingZodSchema } from "../shipping.types";

export type ShippingControllerCalculateRequest = {
  body: z.infer<typeof ShippingControllerCalculateSchema>;
};

export const ShippingControllerCalculateSchema = z
  .object({
    customerId: NumberOrString,
    locationId: StringOrObjectId,
  })
  .merge(ShippingZodSchema.pick({ destination: true }));

export type ShippingControllerCalculateResponse = Awaited<
  ReturnType<typeof ShippingServiceCalculate>
>;

export const ShippingControllerCalculate = _(
  async ({ body }: ShippingControllerCalculateRequest) => {
    const validateData = ShippingControllerCalculateSchema.parse(body);
    return ShippingServiceCalculate(validateData);
  }
);

import { _ } from "~/library/handler";

import { z } from "zod";
import { StringOrObjectIdType } from "~/library/zod";
import { ShippingServiceCalculate } from "../shipping.service";

export type ShippingControllerCalculateRequest = {
  body: z.infer<typeof ShippingControllerCalculateSchema>;
};

export const ShippingControllerCalculateSchema = z.object({
  locationId: StringOrObjectIdType,
  destination: z.object({
    fullAddress: z.string(),
  }),
});

export type ShippingControllerCalculateResponse = Awaited<
  ReturnType<typeof ShippingServiceCalculate>
>;

export const ShippingControllerCalculate = _(
  async ({ body }: ShippingControllerCalculateRequest) => {
    const validateData = ShippingControllerCalculateSchema.parse(body);
    return ShippingServiceCalculate(validateData);
  }
);

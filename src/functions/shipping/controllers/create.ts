import { _ } from "~/library/handler";

import { z } from "zod";
import { NumberOrString, StringOrObjectIdType } from "~/library/zod";
import { ShippingServiceCreate } from "../services/create";
import { ShippingZodSchema } from "../shipping.types";

export type ShippingControllerCreateRequest = {
  body: z.infer<typeof ShippingControllerCreateSchema>;
};

export const ShippingControllerCreateSchema = z
  .object({
    locationId: StringOrObjectIdType,
    customerId: NumberOrString,
  })
  .merge(ShippingZodSchema.pick({ destination: true }));

export type ShippingControllerCreateResponse = Awaited<
  ReturnType<typeof ShippingServiceCreate>
>;

export const ShippingControllerCreate = _(
  async ({ body }: ShippingControllerCreateRequest) => {
    const validateData = ShippingControllerCreateSchema.parse(body);
    return ShippingServiceCreate(validateData);
  }
);

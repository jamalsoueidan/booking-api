import { _ } from "~/library/handler";

import { z } from "zod";
import { NumberOrStringType, StringOrObjectIdType } from "~/library/zod";
import { ShippingServiceCreate } from "../services/create";
import { ShippingZodSchema } from "../shipping.types";

export type ShippingControllerCreateRequest = {
  body: z.infer<typeof ShippingControllerCreateSchema>;
};

export const ShippingControllerCreateSchema = z
  .object({
    locationId: StringOrObjectIdType,
    customerId: NumberOrStringType,
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

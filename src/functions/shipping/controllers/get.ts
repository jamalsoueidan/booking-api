import { _ } from "~/library/handler";

import { z } from "zod";
import { StringOrObjectIdType } from "~/library/zod";
import { ShippingServiceGet } from "../services/get";

export type ShippingControllerGetRequest = {
  query: z.infer<typeof ShippingControllerGetSchema>;
};

export const ShippingControllerGetSchema = z.object({
  shippingId: StringOrObjectIdType,
});

export type ShippingControllerGetResponse = Awaited<
  ReturnType<typeof ShippingServiceGet>
>;

export const ShippingControllerGet = _(
  async ({ query }: ShippingControllerGetRequest) => {
    const validateData = ShippingControllerGetSchema.parse(query);
    return ShippingServiceGet(validateData);
  }
);

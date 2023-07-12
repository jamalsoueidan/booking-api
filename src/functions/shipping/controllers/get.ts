import { _ } from "~/library/handler";

import { ShippingServiceGet } from "../shipping.service";
import { ShippingBody } from "../shipping.types";

export type ShippingControllerGetRequest = {
  body: ShippingBody;
};

export type ShippingControllerGetResponse = Awaited<
  ReturnType<typeof ShippingServiceGet>
>;

export const ShippingControllerGet = _(
  async ({ body }: ShippingControllerGetRequest) => {
    return ShippingServiceGet(body);
  }
);

import { _ } from "~/library/handler";

import { ShippingBody, ShippingServiceRates } from "../services/rates";

export type ShippingControllerRatesRequest = {
  body: ShippingBody;
};

export type ShippingControllerRatesResponse = Awaited<
  ReturnType<typeof ShippingServiceRates>
>;

export const ShippingControllerRates = _(
  async ({ body }: ShippingControllerRatesRequest) => {
    return ShippingServiceRates(body);
  }
);

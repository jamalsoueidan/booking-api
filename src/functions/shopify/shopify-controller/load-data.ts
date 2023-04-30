import { _ } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import {
  ShopifyCustomer,
  ShopifyServiceLoadCollections,
} from "../shopify-service";

export type ShopifyControllerSearchCustomersResponse = ShopifyCustomer[];

export const ShopifyControllerLoadData = _(jwtVerify, async () => {
  return ShopifyServiceLoadCollections();
});

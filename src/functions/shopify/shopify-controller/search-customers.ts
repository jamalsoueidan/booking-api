import { z } from "zod";
import { _ } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import {
  ShopifyCustomer,
  ShopifyServiceSearchCustomers,
} from "../shopify-service";

export const ShopifyControllerSearchCustomersSchema = z.object({
  keyword: z.string(),
  limit: z.number().default(5).optional(),
});

export type ShopifyControllerSearchCustomersQuery = z.infer<
  typeof ShopifyControllerSearchCustomersSchema
>;

export type ShopifyControllerSearchCustomersRequest = {
  query: ShopifyControllerSearchCustomersQuery;
};

export type ShopifyControllerSearchCustomersResponse = ShopifyCustomer[];

export const ShopifyControllerSearchCustomers = _(
  jwtVerify,
  async ({ query }: ShopifyControllerSearchCustomersRequest) => {
    const validateQuery = ShopifyControllerSearchCustomersSchema.parse(query);
    return ShopifyServiceSearchCustomers(validateQuery);
  }
);

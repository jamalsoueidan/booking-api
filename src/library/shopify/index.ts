import { createAdminApiClient } from "@shopify/admin-api-client";

/**
 * Create Shopify Admin client.
 */
export const shopifyAdmin = createAdminApiClient({
  storeDomain: process.env["ShopifyStoreDomain"] || "",
  accessToken: process.env["ShopifyApiAccessToken"] || "",
  apiVersion: "2024-01",
});

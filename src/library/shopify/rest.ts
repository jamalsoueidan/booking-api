import { createAdminRestApiClient } from "@shopify/admin-api-client";

export const shopifyRest = createAdminRestApiClient({
  storeDomain: process.env["ShopifyStoreDomain"] || "",
  accessToken: process.env["ShopifyApiAccessToken"] || "",
  apiVersion: "2024-01",
});

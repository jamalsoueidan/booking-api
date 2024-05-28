import { createAdminApiClient } from "@shopify/admin-api-client";

/**
 * Create Shopify Admin client.
 */
export const shopifyAdmin = () => {
  const keys = [
    "ShopifyApiAccessToken",
    "ShopifyApiAccessToken1",
    "ShopifyApiAccessToken2",
  ];

  const getRandomKey = () => {
    const randomIndex = Math.floor(Math.random() * keys.length);
    return keys[randomIndex];
  };

  // Get a random key
  const randomKey = getRandomKey();

  return createAdminApiClient({
    storeDomain: process.env["ShopifyStoreDomain"] || "",
    accessToken: process.env[randomKey] || "",
    apiVersion: "2024-01",
  });
};

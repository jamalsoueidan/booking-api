import { LATEST_API_VERSION, shopifyApi } from "@shopify/shopify-api";
import "@shopify/shopify-api/adapters/node";

/**
 * Create Spi's Storefront client.
 */
const shopify = shopifyApi({
  apiKey: process.env["ShopifyApiKey"] || "",
  apiSecretKey: process.env["ShopifyApiSecretKey"] || "",
  adminApiAccessToken: process.env["ShopifyApiAccessToken"] || "",
  apiVersion: LATEST_API_VERSION,
  isCustomStoreApp: true,
  scopes: [],
  isEmbeddedApp: false,
  hostName: process.env["ShopifyStoreDomain"] || "",
});

export const shopifyAdmin = new shopify.clients.Graphql({
  session: shopify.session.customAppSession(
    process.env["ShopifyStoreDomain"] || ""
  ),
});

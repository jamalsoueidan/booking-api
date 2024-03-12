import { ApiType, shopifyApiProject } from "@shopify/api-codegen-preset";

export default {
  schema: "https://shopify.dev/admin-graphql-direct-proxy/2023-10",
  documents: ["./src/**/*.{ts,tsx}"],
  projects: {
    default: shopifyApiProject({
      apiType: ApiType.Admin,
      apiVersion: "2023-10",
      documents: ["./src/**/*.{ts,tsx}"],
      outputDir: "./src/types",
    }),
  },
};

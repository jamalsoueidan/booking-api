import { ApiType, shopifyApiProject } from "@shopify/api-codegen-preset";

export default {
  // For syntax highlighting / auto-complete when writing operations
  schema: "https://shopify.dev/admin-graphql-direct-proxy/2023-10",
  documents: ["*.ts", "!node_modules"],
  projects: {
    // To produce variable / return types for Admin API operations
    default: shopifyApiProject({
      apiType: ApiType.Admin,
      apiVersion: "2023-10",
      outputDir: "./src/types",
    }),
  },
};

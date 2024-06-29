import { ApiType, shopifyApiProject } from "@shopify/api-codegen-preset";

export default {
  schema: "https://shopify.dev/admin-graphql-direct-proxy",
  documents: ["*.ts", "!node_modules"],
  projects: {
    default: shopifyApiProject({
      apiType: ApiType.Admin,
      apiVersion: "2024-04",
      outputDir: "./src/types",
    }),
  },
};

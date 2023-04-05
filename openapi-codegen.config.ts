import {
  generateSchemaTypes,
  generateReactQueryComponents,
} from "@openapi-codegen/typescript";
import { defineConfig } from "@openapi-codegen/cli";
export default defineConfig({
  bookingApi: {
    from: {
      relativePath: "./docs/openapi.yaml",
      source: "file",
    },
    outputDir: "./dist",
    to: async (context) => {
      const filenamePrefix = "bookingApi";
      const { schemasFiles } = await generateSchemaTypes(context, {
        filenamePrefix,
      });
      await generateReactQueryComponents(context, {
        filenamePrefix,
        schemasFiles,
      });
    },
  },
});

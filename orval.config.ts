import { defineConfig } from "orval";

export default defineConfig({
  petstore: {
    output: {
      mode: "split",
      schemas: "dist/api/model",
      client: "react-query",
      target: "dist/api/",
      mock: true,
    },
    input: {
      target: "./docs/openapi.yaml",
    },
  },
});

module.exports = {
  "booking-api": {
    output: {
      mode: "split",
      schemas: "api/model",
      client: "axios",
      target: "api/",
      mock: false,
      override: {
        useDates: true,
        query: {
          useQuery: false,
          useInfinite: false,
        },
        mutator: {
          path: "./api/mutator/query-client.ts",
          name: "queryClient",
        },
      },
    },
    input: {
      target: "./docs/openapi.yaml",
    },
  },
};

module.exports = {
  "booking-api": {
    output: {
      mode: "split",
      schemas: "dist/api/model",
      client: "react-query",
      target: "dist/api/",
      mock: true,
      override: {
        useDates: true,
        query: {
          useQuery: false,
          useInfinite: false,
        },
      },
    },
    input: {
      target: "./docs/openapi.yaml",
    },
  },
};

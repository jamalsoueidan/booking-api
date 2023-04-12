module.exports = {
  "booking-api": {
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
};

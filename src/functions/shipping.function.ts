import {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
  app,
} from "@azure/functions";

async function ShippingRates(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(
    `Http function processed request for url "${request.url}" ${request.method}`
  );

  const onMinDate = new Date(Date.now() + 86400000).toISOString(); // +1 day
  const onMaxDate = new Date(Date.now() + 2 * 86400000).toISOString(); // +2 days

  // Regular shipping is 3 to 7 days after today
  const regMinDate = new Date(Date.now() + 3 * 86400000).toISOString(); // +3 days
  const regMaxDate = new Date(Date.now() + 7 * 86400000).toISOString(); // +7 days

  return {
    jsonBody: {
      rates: [
        {
          service_name: "På din adresse",
          service_code: "ETON",
          total_price: 0,
          currency: "DKK",
          min_delivery_date: onMinDate,
          max_delivery_date: onMaxDate,
        },
        {
          service_name: "Forsendelse + På din adresse",
          service_code: "ETREG",
          total_price: 0,
          currency: "DKK",
          min_delivery_date: regMinDate,
          max_delivery_date: regMaxDate,
        },
        {
          service_name: "Forsendelse",
          service_code: "ETREG",
          total_price: 0,
          currency: "DKK",
          min_delivery_date: regMinDate,
          max_delivery_date: regMaxDate,
        },
      ],
    },
  };
}

app.http("shippingRates", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "shipping/rates",
  handler: ShippingRates,
});

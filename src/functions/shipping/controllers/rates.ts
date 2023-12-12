import {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { ShippingServiceRates } from "../services/rates";

export async function ShippingControllerRates(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(
    `Http function processed request for url "${request.url}" ${request.method}`
  );
  const body = await request.json();
  const jsonBody = await ShippingServiceRates(body as unknown as any);
  return {
    jsonBody,
  };
}

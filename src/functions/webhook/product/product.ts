import { InvocationContext } from "@azure/functions";
import { z } from "zod";

import { telemetryClient } from "~/library/application-insight";
import { connect } from "~/library/mongoose";

export const variantSchema = z.object({
  admin_graphql_api_id: z.string(),
  id: z.number(),
});

export const productUpdateSchema = z.object({
  admin_graphql_api_id: z.string(),
  handle: z.string(),
  id: z.number(),
  title: z.string(),
  variants: z.array(variantSchema),
});

export async function webhookProductProcess(
  queueItem: unknown,
  context: InvocationContext
) {
  try {
    await connect();
    console.log(queueItem);
    context.log("webhook product success");
  } catch (exception: unknown) {
    telemetryClient.trackException({
      exception: exception as Error,
    });
    context.error(
      `webhook order error ${(queueItem as any).order_id}`,
      exception
    );
  }
}

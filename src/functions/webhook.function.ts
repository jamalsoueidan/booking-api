import "module-alias/register";

import { HttpRequest, InvocationContext, app } from "@azure/functions";

/*
 * just for testing webhooks
 */

app.http("webhook", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "webhooks",
  handler: async (request: HttpRequest, context: InvocationContext) => {
    console.log(await request.json());
    return { body: "test" };
  },
});

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
    const response = await request.json();
    console.log(response);
    console.log(JSON.stringify(response));
    return { body: "test" };
  },
});

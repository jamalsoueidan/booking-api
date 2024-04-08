import "module-alias/register";

import { HttpRequest, InvocationContext, app } from "@azure/functions";
import { connect } from "~/library/mongoose";
import { UserModel } from "./user";

export type Customer = {
  id: number;
  tags: string;
};

app.http("webhookCustomerUpdate", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "webhooks/customer/update",
  handler: async (request: HttpRequest, context: InvocationContext) => {
    await connect();
    const customer = (await request.json()) as unknown as Customer;
    const active = customer.tags.includes("public");
    const customerId = customer.id;
    const response = await UserModel.updateOne({ customerId }, { active });
    context.log(
      `Customer Update, customerId = '${customerId}', active = '${active}', update = '${response.modifiedCount}'`
    );
    return { body: "" };
  },
});

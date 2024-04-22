import "module-alias/register";

import { HttpRequest, InvocationContext, app } from "@azure/functions";
import { connect } from "~/library/mongoose";
import { BlockedModel } from "./blocked/blocked.model";
import { LocationModel } from "./location";
import { ScheduleModel } from "./schedule";
import { UserModel } from "./user";

export type Customer = {
  id: number;
  tags: string;
  email: string;
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
    const response = await UserModel.updateOne(
      { customerId },
      { active, email: customer.email }
    );
    context.log(
      `Customer Update, customerId = '${customerId}', active = '${active}', update = '${response.modifiedCount}'`
    );
    return { body: "" };
  },
});

app.http("webhookCustomerDelete", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "webhooks/customer/delete",
  handler: async (request: HttpRequest, context: InvocationContext) => {
    await connect();
    const customer = (await request.json()) as unknown as Customer;
    const customerId = customer.id;
    const response = await UserModel.deleteOne({
      customerId,
      $or: [
        { email: { $regex: "mailosaur", $options: "i" } },
        { email: { $eq: "" } },
      ],
    });

    if (response.deletedCount > 0) {
      ScheduleModel.deleteMany({
        customerId,
      });
      LocationModel.deleteMany({
        customerId,
      });
      BlockedModel.deleteMany({
        customerId,
      });
    }

    context.log(
      `Customer Delete, customerId = '${customerId}', update = '${response.deletedCount}'`
    );
    return { body: "" };
  },
});

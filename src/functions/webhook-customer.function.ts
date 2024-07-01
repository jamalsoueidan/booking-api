import "module-alias/register";

import { app, HttpRequest, InvocationContext } from "@azure/functions";
import * as df from "durable-functions";
import { connect } from "~/library/mongoose";
import { BlockedModel } from "./blocked/blocked.model";
import { CustomerUpdateOrchestration } from "./customer/orchestrations/customer/update";
import { CustomerServiceGet } from "./customer/services/customer/get";
import { CustomerServiceUpdate } from "./customer/services/customer/update";
import { CustomerProductsServiceListIds } from "./customer/services/product/list-ids";
import { LocationModel } from "./location";
import { ScheduleModel } from "./schedule";
import { UserModel } from "./user";
import { ActivateAllProductsOrchestration } from "./webhook/customer/update";

export type Customer = {
  id: number;
  email: string;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  orders_count: number;
  state: string;
  total_spent: string;
  last_order_id: number;
  note: string;
  verified_email: boolean;
  multipass_identifier: any;
  tax_exempt: boolean;
  tags: string;
  last_order_name: string;
  currency: string;
  phone: string;
  addresses: Array<{
    id: number;
    customer_id: number;
    first_name: string;
    last_name: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    province?: string;
    country: string;
    zip: string;
    phone: string;
    name: string;
    province_code: any;
    country_code: string;
    country_name: string;
    default: boolean;
  }>;
  tax_exemptions: Array<any>;
  email_marketing_consent: {
    state: string;
    opt_in_level: string;
    consent_updated_at: string;
  };
  sms_marketing_consent: {
    state: string;
    opt_in_level: string;
    consent_updated_at: any;
    consent_collected_from: string;
  };
  admin_graphql_api_id: string;
  default_address: {
    id: number;
    customer_id: number;
    first_name: string;
    last_name: string;
    company: any;
    address1: string;
    address2: any;
    city: string;
    province: any;
    country: string;
    zip: string;
    phone: string;
    name: string;
    province_code: any;
    country_code: string;
    country_name: string;
    default: boolean;
  };
};

app.http("webhookCustomerUpdate", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "webhooks/customer/update",
  extraInputs: [df.input.durableClient()],
  handler: async (request: HttpRequest, context: InvocationContext) => {
    try {
      await connect();
      const shopifyCustomer = (await request.json()) as unknown as Customer;
      const active = shopifyCustomer.tags.includes("active");
      const customerId = shopifyCustomer.id;

      const customer = await CustomerServiceGet({ customerId });

      const newCustomer = await CustomerServiceUpdate(
        { customerId },
        {
          active,
          email: shopifyCustomer.email,
          fullname: `${shopifyCustomer.first_name} ${shopifyCustomer.last_name}`,
          phone: shopifyCustomer.phone,
        }
      );

      context.log(
        `Customer Update, customerId = '${customerId}', active = '${active}', updated`
      );

      if (customer.active !== active) {
        await CustomerUpdateOrchestration(newCustomer, context);

        const productIds = await CustomerProductsServiceListIds({
          customerId,
        });

        await ActivateAllProductsOrchestration(
          { customerId, productIds },
          context
        );
      }

      return { body: "" };
    } catch (err) {
      return { body: "" };
    }
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
      //TODO:
      //Delete also his content in shopify?
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

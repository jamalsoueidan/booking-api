import "module-alias/register";

import { HttpRequest, InvocationContext, app } from "@azure/functions";
import { connect } from "~/library/mongoose";
import { BlockedModel } from "./blocked/blocked.model";
import { CustomerServiceUpdate } from "./customer/services/customer/update";
import { LocationModel } from "./location";
import { ScheduleModel } from "./schedule";
import { UserModel } from "./user";

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
  handler: async (request: HttpRequest, context: InvocationContext) => {
    await connect();
    const customer = (await request.json()) as unknown as Customer;
    const active = customer.tags.includes("active");
    const customerId = customer.id;
    await CustomerServiceUpdate(
      { customerId },
      {
        active,
        email: customer.email,
        fullname: `${customer.first_name} ${customer.last_name}`,
        phone: customer.phone,
      }
    );
    context.log(
      `Customer Update, customerId = '${customerId}', active = '${active}', updated`
    );
    /*
    TODO:
    should disable products?
    should disable content metafields?
    maybe use Shopify Flow?
    */
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

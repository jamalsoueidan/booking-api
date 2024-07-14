import "module-alias/register";

import { app, HttpRequest, InvocationContext } from "@azure/functions";
import * as df from "durable-functions";
import { connect } from "~/library/mongoose";
import { CustomerProductServiceUpdate } from "./customer/services/product/update";
import { WebhookUpdateProductOrchestration } from "./webhook/product/update";

type Product = {
  admin_graphql_api_id: string;
  body_html: string;
  created_at: string;
  handle: string;
  id: number;
  product_type: string;
  published_at: string;
  template_suffix: any;
  title: string;
  updated_at: string;
  vendor: string;
  status: string;
  published_scope: string;
  tags: string;
  variants: Array<{
    admin_graphql_api_id: string;
    barcode: string;
    compare_at_price: string;
    created_at: string;
    fulfillment_service: string;
    id: number;
    inventory_management: any;
    inventory_policy: string;
    position: number;
    price: string;
    product_id: number;
    sku: string;
    taxable: boolean;
    title: string;
    updated_at: string;
    option1: string;
    option2: any;
    option3: any;
    grams: number;
    image_id: any;
    weight: number;
    weight_unit: string;
    inventory_item_id: number;
    inventory_quantity: number;
    old_inventory_quantity: number;
    requires_shipping: boolean;
  }>;
  options: Array<{
    name: string;
    id: number;
    product_id: number;
    position: number;
    values: Array<string>;
  }>;
  images: Array<any>;
  image: any;
  variant_gids: Array<{
    admin_graphql_api_id: string;
    updated_at: string;
  }>;
};

app.http("webhookProductUpdate", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "webhooks/product/update",
  extraInputs: [df.input.durableClient()],
  handler: async (request: HttpRequest, context: InvocationContext) => {
    try {
      await connect();
      const shopifyProduct = (await request.json()) as unknown as Product;
      const shouldProcessUpdate = shopifyProduct.tags.includes("update");
      const regex = /userid-(\d+)/;
      const match = shopifyProduct.tags.match(regex);

      if (match && shouldProcessUpdate && shopifyProduct.id) {
        // The user ID is in the first capturing group
        const customerId = match[1];
        console.log(`User ID: ${customerId}, - ${shopifyProduct.id}`);

        await CustomerProductServiceUpdate(
          {
            customerId: parseInt(customerId),
            productId: shopifyProduct.id,
          },
          { title: shopifyProduct.title, description: shopifyProduct.body_html }
        );

        await WebhookUpdateProductOrchestration(
          {
            customerId: parseInt(customerId),
            productId: shopifyProduct.id,
          },
          context
        );
      }

      return { body: "" };
    } catch (err) {
      return { body: "" };
    }
  },
});

import {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
  app,
  output,
} from "@azure/functions";
import { LATEST_API_VERSION, shopifyApi } from "@shopify/shopify-api";
import "@shopify/shopify-api/adapters/node";
import "module-alias/register";

/**
 * Create Spi's Storefront client.
 */
const shopify = shopifyApi({
  apiKey: process.env["ShopifyApiKey"] || "",
  apiSecretKey: process.env["ShopifyApiSecretKey"] || "",
  adminApiAccessToken: process.env["ShopifyApiAccessToken"] || "",
  apiVersion: LATEST_API_VERSION,
  isCustomStoreApp: true,
  scopes: [],
  isEmbeddedApp: false,
  hostName: process.env["ShopifyStoreDomain"] || "",
});

const adminApi = new shopify.clients.Graphql({
  session: shopify.session.customAppSession(
    process.env["ShopifyStoreDomain"] || ""
  ),
});

type queueItem = {
  customerId: string;
  filename: string;
};

export async function storageQueueTrigger1(
  queueItem: unknown,
  context: InvocationContext
): Promise<void> {
  context.log("Storage queue function processed work item:", queueItem);

  const body = queueItem as queueItem;

  const fileGet = await adminApi.query({
    data: {
      query: FILE_GET,
      variables: {
        query: body.filename,
      },
    },
  });

  context.log(fileGet.body);
}

app.storageQueue("storageQueueTrigger1", {
  queueName: "outqueue",
  connection: "QueueStorage",
  handler: storageQueueTrigger1,
});

const queueOutput = output.storageQueue({
  queueName: "outqueue",
  connection: "QueueStorage",
});

export async function httpTrigger1(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const body = await request.json();
  context.extraOutputs.set(queueOutput, body);
  return { body: "Created queue item." };
}

app.http("httpTrigger1", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "testerne",
  extraOutputs: [queueOutput],
  handler: httpTrigger1,
});

const FILE_GET = `#graphql
  query FileGet($query: String!) {
    files(first: 10, sortKey: UPDATED_AT, reverse: true, query: $query) {
      nodes {
        preview {
          image {
            url
            width
            height
          }
        }
      }
    }
  }
` as const;

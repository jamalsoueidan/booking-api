import { InvocationContext } from "@azure/functions";
import * as df from "durable-functions";
import { OrchestrationContext } from "durable-functions";
import {
  updateArticle,
  updateArticleName,
} from "~/functions/customer/orchestrations/customer/update/update-article";
import {
  updateProduct,
  updateProductName,
} from "~/functions/customer/orchestrations/product/update/update-product";
import { activityType } from "~/library/orchestration";

const orchestrator: df.OrchestrationHandler = function* (
  context: OrchestrationContext
) {
  const input = context.df.getInput() as Input;

  const productUpdated: Awaited<ReturnType<typeof updateProduct>> =
    yield context.df.callActivity(
      updateProductName,
      activityType<typeof updateProduct>(input)
    );

  const article: Awaited<ReturnType<typeof updateArticle>> =
    yield context.df.callActivity(
      updateArticleName,
      activityType<typeof updateArticle>(input)
    );

  return { productUpdated, article };
};

df.app.orchestration("WebhookUpdateProductOrchestration", orchestrator);

type Input = { customerId: number; productId: number };

export const WebhookUpdateProductOrchestration = async (
  input: Input,
  context: InvocationContext
): Promise<string> => {
  const client = df.getClient(context);
  const instanceId: string = await client.startNew(
    "WebhookUpdateProductOrchestration",
    {
      input,
    }
  );

  context.log(`Started orchestration with ID = '${instanceId}'.`);

  return instanceId;
};

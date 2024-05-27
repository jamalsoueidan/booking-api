import { InvocationContext } from "@azure/functions";
import * as df from "durable-functions";
import { OrchestrationContext } from "durable-functions";
import { activityType } from "~/library/orchestration";
import { updatePrice } from "./update/update-price";
import { updateProduct } from "./update/update-product";

const updateProductName = "updateProduct";
df.app.activity(updateProductName, { handler: updateProduct });

const updatePriceName = "updatePrice";
df.app.activity(updatePriceName, { handler: updatePrice });

const orchestrator: df.OrchestrationHandler = function* (
  context: OrchestrationContext
) {
  const input = context.df.getInput() as Input;

  const productUpdated: Awaited<ReturnType<typeof updateProduct>> =
    yield context.df.callActivity(
      updateProductName,
      activityType<typeof updateProduct>(input)
    );

  const priceUpdated: Awaited<ReturnType<typeof updatePrice>> =
    yield context.df.callActivity(
      updatePriceName,
      activityType<typeof updatePrice>(input)
    );

  return { productUpdated, priceUpdated };
};

df.app.orchestration("updateProductShopify", orchestrator);

type Input = { productId: number; customerId: number };

export const CustomerProductUpdateOrchestration = async (
  input: Input,
  context: InvocationContext
): Promise<string> => {
  const client = df.getClient(context);
  const instanceId: string = await client.startNew("updateProductShopify", {
    input,
  });

  context.log(`Started orchestration with ID = '${instanceId}'.`);

  return instanceId;
};

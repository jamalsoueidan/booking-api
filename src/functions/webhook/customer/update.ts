import { InvocationContext } from "@azure/functions";
import { addSeconds } from "date-fns";
import * as df from "durable-functions";
import { OrchestrationContext } from "durable-functions";
import {
  updateProduct,
  updateProductName,
} from "~/functions/customer/orchestrations/product/update/update-product";
import { activityType } from "~/library/orchestration";

const orchestrator: df.OrchestrationHandler = function* (
  context: OrchestrationContext
) {
  const input = context.df.getInput() as Input;

  for (const productId of input.productIds) {
    yield context.df.callActivity(
      updateProductName,
      activityType<typeof updateProduct>({
        customerId: input.customerId,
        productId,
      })
    );

    const nextExecution = addSeconds(context.df.currentUtcDateTime, 5);
    yield context.df.createTimer(nextExecution);
  }

  return { done: true };
};

df.app.orchestration("ActivateAllProductsOrchestration", orchestrator);

type Input = { customerId: number; productIds: number[] };

export const ActivateAllProductsOrchestration = async (
  input: Input,
  context: InvocationContext
): Promise<string> => {
  const client = df.getClient(context);
  const instanceId: string = await client.startNew(
    "ActivateAllProductsOrchestration",
    {
      input,
    }
  );

  context.log(`Started orchestration with ID = '${instanceId}'.`);

  return instanceId;
};

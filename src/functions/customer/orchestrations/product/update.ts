import { InvocationContext } from "@azure/functions";
import * as df from "durable-functions";
import { OrchestrationContext } from "durable-functions";
import { activityType } from "~/library/orchestration";
import {
  updateUserMetaobject,
  updateUserMetaobjectName,
} from "../customer/update/update-user-metaobject";
import { updatePrice, updatePriceName } from "./update/update-price";
import { updateProduct, updateProductName } from "./update/update-product";

df.app.activity(updateProductName, { handler: updateProduct });
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

  const userField: Awaited<ReturnType<typeof updateUserMetaobject>> =
    yield context.df.callActivity(
      updateUserMetaobjectName,
      activityType<typeof updateUserMetaobject>(input)
    );

  return { productUpdated, priceUpdated, userField };
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

import { InvocationContext } from "@azure/functions";
import * as df from "durable-functions";
import { OrchestrationContext } from "durable-functions";
import { activityType } from "~/library/orchestration";
import {
  updateParentProduct,
  updateParentProductName,
} from "./add/update-parent-product";
import {
  updateProductOption,
  updateProductOptionName,
} from "./add/update-product-option";

df.app.activity(updateParentProductName, { handler: updateParentProduct });
df.app.activity(updateProductOptionName, { handler: updateProductOption });

const orchestrator: df.OrchestrationHandler = function* (
  context: OrchestrationContext
) {
  const input = context.df.getInput() as Input;

  const parentProduct: Awaited<ReturnType<typeof updateParentProduct>> =
    yield context.df.callActivity(
      updateParentProductName,
      activityType<typeof updateParentProduct>(input)
    );

  const productOption: Awaited<ReturnType<typeof updateProductOption>> =
    yield context.df.callActivity(
      updateProductOptionName,
      activityType<typeof updateProductOption>(input)
    );

  return { parentProduct, productOption };
};

df.app.orchestration("CustomerProductOptionsAddOrchestration", orchestrator);

type Input = {
  productOptionId: number;
  customerId: number;
  productId: number;
};

export const CustomerProductOptionsAddOrchestration = async (
  input: Input,
  context: InvocationContext
): Promise<string> => {
  const client = df.getClient(context);
  const instanceId: string = await client.startNew(
    "CustomerProductOptionsAddOrchestration",
    {
      input,
    }
  );

  context.log(`Started orchestration with ID = '${instanceId}'.`);

  return instanceId;
};

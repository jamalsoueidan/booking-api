import { InvocationContext } from "@azure/functions";
import * as df from "durable-functions";
import { OrchestrationContext } from "durable-functions";
import { activityType } from "~/library/orchestration";
import {
  destroyProductOption,
  destroyProductOptionName,
} from "./destroy/destroy-option";

const orchestrator: df.OrchestrationHandler = function* (
  context: OrchestrationContext
) {
  const input = context.df.getInput() as Input;

  const destroyOption: Awaited<ReturnType<typeof destroyProductOption>> =
    yield context.df.callActivity(
      destroyProductOptionName,
      activityType<typeof destroyProductOption>(input)
    );

  return { destroyOption };
};

df.app.orchestration(
  "CustomerProductOptionsDestroyOrchestration",
  orchestrator
);

type Input = {
  productOptionId: number;
};

export const CustomerProductOptionsDestroyOrchestration = async (
  input: Input,
  context: InvocationContext
): Promise<string> => {
  const client = df.getClient(context);
  const instanceId: string = await client.startNew(
    "CustomerProductOptionsDestroyOrchestration",
    {
      input,
    }
  );

  context.log(`Started orchestration with ID = '${instanceId}'.`);

  return instanceId;
};

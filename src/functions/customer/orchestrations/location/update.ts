import { InvocationContext } from "@azure/functions";
import * as df from "durable-functions";
import { OrchestrationContext } from "durable-functions";
import { activityType } from "~/library/orchestration";
import { StringOrObjectIdType } from "~/library/zod";
import {
  updateLocationMetafield,
  updateLocationMetafieldName,
} from "./update/update-location-metafield";

df.app.activity(updateLocationMetafieldName, {
  handler: updateLocationMetafield,
});

const orchestrator: df.OrchestrationHandler = function* (
  context: OrchestrationContext
) {
  const input = context.df.getInput() as Input;

  const metafield: Awaited<ReturnType<typeof updateLocationMetafield>> =
    yield context.df.callActivity(
      updateLocationMetafieldName,
      activityType<typeof updateLocationMetafield>(input)
    );

  return { metafield };
};

df.app.orchestration("CustomerLocationUpdateOrchestration", orchestrator);

type Input = {
  locationId: StringOrObjectIdType;
};

export const CustomerLocationUpdateOrchestration = async (
  input: Input,
  context: InvocationContext
): Promise<string> => {
  const client = df.getClient(context);
  const instanceId: string = await client.startNew(
    "CustomerLocationUpdateOrchestration",
    {
      input,
    }
  );

  context.log(`Started orchestration with ID = '${instanceId}'.`);

  return instanceId;
};

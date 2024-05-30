import { InvocationContext } from "@azure/functions";
import * as df from "durable-functions";
import { OrchestrationContext } from "durable-functions";
import { activityType } from "~/library/orchestration";
import { StringOrObjectIdType } from "~/library/zod";
import {
  createLocationMetafield,
  createLocationMetafieldName,
} from "./create/create-location-metafield";

df.app.activity(createLocationMetafieldName, {
  handler: createLocationMetafield,
});

const orchestrator: df.OrchestrationHandler = function* (
  context: OrchestrationContext
) {
  const input = context.df.getInput() as Input;

  const metafield: Awaited<ReturnType<typeof createLocationMetafield>> =
    yield context.df.callActivity(
      createLocationMetafieldName,
      activityType<typeof createLocationMetafield>(input)
    );

  return { metafield };
};

df.app.orchestration("CustomerLocationCreateOrchestration", orchestrator);

type Input = {
  locationId: StringOrObjectIdType;
};

export const CustomerLocationCreateOrchestration = async (
  input: Input,
  context: InvocationContext
): Promise<string> => {
  const client = df.getClient(context);
  const instanceId: string = await client.startNew(
    "CustomerLocationCreateOrchestration",
    {
      input,
    }
  );

  context.log(`Started orchestration with ID = '${instanceId}'.`);

  return instanceId;
};

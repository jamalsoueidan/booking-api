import { InvocationContext } from "@azure/functions";
import * as df from "durable-functions";
import { OrchestrationContext } from "durable-functions";
import { activityType } from "~/library/orchestration";
import { StringOrObjectIdType } from "~/library/zod";
import {
  createScheduleMetafield,
  createScheduleMetafieldName,
} from "./create/create-schedule-metafield";

df.app.activity(createScheduleMetafieldName, {
  handler: createScheduleMetafield,
});

const orchestrator: df.OrchestrationHandler = function* (
  context: OrchestrationContext
) {
  const input = context.df.getInput() as Input;

  const metafield: Awaited<ReturnType<typeof createScheduleMetafield>> =
    yield context.df.callActivity(
      createScheduleMetafieldName,
      activityType<typeof createScheduleMetafield>(input)
    );

  return { metafield };
};

df.app.orchestration("CustomerScheduleUpdateOrchestration", orchestrator);

type Input = {
  scheduleId: StringOrObjectIdType;
  customerId: number;
};

export const CustomerScheduleUpdateOrchestration = async (
  input: Input,
  context: InvocationContext
): Promise<string> => {
  const client = df.getClient(context);
  const instanceId: string = await client.startNew(
    "CustomerScheduleUpdateOrchestration",
    {
      input,
    }
  );

  context.log(`Started orchestration with ID = '${instanceId}'.`);

  return instanceId;
};

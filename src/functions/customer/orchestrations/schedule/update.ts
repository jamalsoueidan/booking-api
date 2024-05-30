import { InvocationContext } from "@azure/functions";
import * as df from "durable-functions";
import { OrchestrationContext } from "durable-functions";
import { activityType } from "~/library/orchestration";
import { StringOrObjectIdType } from "~/library/zod";
import {
  updateScheduleMetafield,
  updateScheduleMetafieldName,
} from "./update/update-schedule-metafield";

df.app.activity(updateScheduleMetafieldName, {
  handler: updateScheduleMetafield,
});

const orchestrator: df.OrchestrationHandler = function* (
  context: OrchestrationContext
) {
  const input = context.df.getInput() as Input;

  const metafield: Awaited<ReturnType<typeof updateScheduleMetafield>> =
    yield context.df.callActivity(
      updateScheduleMetafieldName,
      activityType<typeof updateScheduleMetafield>(input)
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

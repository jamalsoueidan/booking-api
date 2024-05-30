import { InvocationContext } from "@azure/functions";
import * as df from "durable-functions";
import { OrchestrationContext } from "durable-functions";
import { activityType } from "~/library/orchestration";
import { updateArticle, updateArticleName } from "./update/update-article";
import {
  updateUserMetaobject,
  updateUserMetaobjectName,
} from "./update/update-user-metaobject";

df.app.activity(updateUserMetaobjectName, {
  handler: updateUserMetaobject,
});

df.app.activity(updateArticleName, {
  handler: updateArticle,
});

const orchestrator: df.OrchestrationHandler = function* (
  context: OrchestrationContext
) {
  const input = context.df.getInput() as Input;

  const userField: Awaited<ReturnType<typeof updateUserMetaobject>> =
    yield context.df.callActivity(
      updateUserMetaobjectName,
      activityType<typeof updateUserMetaobject>(input)
    );

  const article: Awaited<ReturnType<typeof updateArticle>> =
    yield context.df.callActivity(
      updateArticleName,
      activityType<typeof updateArticle>(input)
    );

  return {
    userField,
    article,
  };
};

type Input = { customerId: number };

df.app.orchestration("updateUserShopify", orchestrator);

export const CustomerUpdateOrchestration = async (
  input: Input,
  context: InvocationContext
): Promise<string> => {
  const client = df.getClient(context);
  const instanceId: string = await client.startNew("updateUserShopify", {
    input,
  });

  context.log(`Started orchestration with ID = '${instanceId}'.`);

  return instanceId;
};

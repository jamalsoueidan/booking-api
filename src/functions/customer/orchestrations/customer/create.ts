import { InvocationContext } from "@azure/functions";
import { addSeconds } from "date-fns";
import * as df from "durable-functions";
import { OrchestrationContext } from "durable-functions";
import { User } from "~/functions/user";
import { activityType } from "~/library/orchestration";
import { createArticle, createArticleName } from "./create/create-article";
import {
  createUserCollection,
  createUserCollectionName,
} from "./create/create-user-collection";
import {
  createUserMetaobject,
  createUserMetaobjectName,
} from "./create/create-user-metaobject";
import {
  publishCollection,
  publishCollectionName,
} from "./create/publish-collection";
import {
  updateUserMetafields,
  updateUserMetafieldsName,
} from "./create/update-user";

df.app.activity(createUserCollectionName, { handler: createUserCollection });
df.app.activity(createUserMetaobjectName, { handler: createUserMetaobject });
df.app.activity(createArticleName, { handler: createArticle });
df.app.activity(publishCollectionName, { handler: publishCollection });
df.app.activity(updateUserMetafieldsName, { handler: updateUserMetafields });

const orchestrator: df.OrchestrationHandler = function* (
  context: OrchestrationContext
) {
  const user = context.df.getInput() as User;

  const collectionMetaobject: Awaited<ReturnType<typeof createUserCollection>> =
    yield context.df.callActivity(
      createUserCollectionName,
      activityType<typeof createUserCollection>({
        user,
      })
    );

  const userMetaobject: Awaited<ReturnType<typeof createUserMetaobject>> =
    yield context.df.callActivity(
      createUserMetaobjectName,
      activityType<typeof createUserMetaobject>({
        user,
        collectionId: collectionMetaobject.id,
      })
    );

  const article: Awaited<ReturnType<typeof createArticle>> =
    yield context.df.callActivity(
      createArticleName,
      activityType<typeof createArticle>({
        user: {
          ...user,
          collectionMetaobjectId: collectionMetaobject.id,
          userMetaobjectId: userMetaobject.id,
        },
      })
    );

  const userUpdated: Awaited<ReturnType<typeof updateUserMetafields>> =
    yield context.df.callActivity(
      updateUserMetafieldsName,
      activityType<typeof updateUserMetafields>({
        collectionMetaobjectId: collectionMetaobject.id,
        userId: user._id,
        userMetaobjectId: userMetaobject.id,
        articleId: article.article.id,
      })
    );

  const nextExecution = addSeconds(context.df.currentUtcDateTime, 5);
  yield context.df.createTimer(nextExecution);

  const publish: Awaited<ReturnType<typeof publishCollection>> =
    yield context.df.callActivity(
      publishCollectionName,
      activityType<typeof publishCollection>({
        collectionId: collectionMetaobject.id,
      })
    );

  return {
    collectionMetaobject,
    userMetaobject,
    publish,
    userUpdated,
    article,
  };
};

df.app.orchestration("createUserShopify", orchestrator);

export const CustomerCreateOrchestration = async (
  input: User,
  context: InvocationContext
): Promise<string> => {
  const client = df.getClient(context);
  const instanceId: string = await client.startNew("createUserShopify", {
    input,
  });

  context.log(`Started orchestration with ID = '${instanceId}'.`);

  return instanceId;
};

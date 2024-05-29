import { InvocationContext } from "@azure/functions";
import * as df from "durable-functions";
import { OrchestrationContext } from "durable-functions";
import { ScheduleProduct } from "~/functions/schedule";
import { activityType } from "~/library/orchestration";
import {
  updateArticle,
  updateArticleName,
} from "../customer/update/update-article";
import {
  destroyProductOption,
  destroyProductOptionName,
} from "../product-options/destroy/destroy-option";
import { destroyProduct, destroyProductName } from "./destroy/destroy-product";

df.app.activity(destroyProductName, { handler: destroyProduct });

const orchestrator: df.OrchestrationHandler = function* (
  context: OrchestrationContext
) {
  const input = context.df.getInput() as Input;

  /*
  /* TODO: Set default=true to the other parentId if exist
  */

  for (const productOption of input.product.options || []) {
    yield context.df.callActivity(
      destroyProductOptionName,
      activityType<typeof destroyProductOption>({
        productOptionId: productOption.productId,
      })
    );
  }

  const productDestroyed: Awaited<ReturnType<typeof destroyProduct>> =
    yield context.df.callActivity(
      destroyProductName,
      activityType<typeof destroyProduct>(input.product)
    );

  const article: Awaited<ReturnType<typeof updateArticle>> =
    yield context.df.callActivity(
      updateArticleName,
      activityType<typeof updateArticle>(input)
    );

  return { productDestroyed, article };
};

df.app.orchestration("CustomerProductDestroyOrchestration", orchestrator);

type Input = {
  product: ScheduleProduct;
  customerId: number;
};

export const CustomerProductDestroyOrchestration = async (
  input: Input,
  context: InvocationContext
): Promise<string> => {
  const client = df.getClient(context);
  const instanceId: string = await client.startNew(
    "CustomerProductDestroyOrchestration",
    {
      input,
    }
  );

  context.log(`Started orchestration with ID = '${instanceId}'.`);

  return instanceId;
};

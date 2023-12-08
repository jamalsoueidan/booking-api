import {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
  app,
  output,
} from "@azure/functions";

import { OrderModel } from "~/functions/order/order.models";
import { OrderZod } from "~/functions/order/order.types";
import { telemetryClient } from "~/library/application-insight";
import { connect } from "~/library/mongoose";

export const orderQueueName = "webhook-order";
export const orderQueueOutput = output.storageQueue({
  queueName: orderQueueName,
  connection: "QueueStorage",
});

export async function webhookOrderProcess(
  queueItem: unknown,
  context: InvocationContext
): Promise<void> {
  try {
    const order = OrderZod.parse(queueItem);

    await connect();
    const existingOrder = await OrderModel.findOne({ _id: order.id });

    if (existingOrder) {
      await OrderModel.findByIdAndUpdate(existingOrder._id, order, {
        new: true,
      });
    } else {
      const newOrder = new OrderModel(order);
      await newOrder.save();
    }

    context.log("webhook order success");
  } catch (exception: unknown) {
    telemetryClient.trackException({
      exception: exception as Error,
    });
    context.error(
      `webhook order error ${(queueItem as any).order_id}`,
      exception
    );
  }
}

app.storageQueue("webhookOrderUpdateProcess", {
  queueName: orderQueueName,
  connection: "QueueStorage",
  handler: webhookOrderProcess,
});

export async function webhookOrder(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const body = await request.json();
  console.log(JSON.stringify(body));
  context.extraOutputs.set(orderQueueOutput, body);
  return { body: "Created queue item." };
}

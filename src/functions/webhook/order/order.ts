import { InvocationContext } from "@azure/functions";

import { OrderModel } from "~/functions/order/order.models";
import { Order } from "~/functions/order/order.types";
import { telemetryClient } from "~/library/application-insight";
import { connect } from "~/library/mongoose";

export async function webhookOrderProcess(
  queueItem: unknown,
  context: InvocationContext
) {
  try {
    const order = Order.parse(queueItem);
    await connect();

    context.log("webhook order success");

    // preserve the properties for each line-item from the first time the order was created
    const existingOrder = await OrderModel.findOne({ id: order.id });
    if (existingOrder) {
      order.line_items = order.line_items.map((newItem) => {
        const existingItem = existingOrder.line_items.find(
          (eItem) => eItem.id === newItem.id
        );

        if (existingItem) {
          newItem.properties = existingItem.properties;
        }

        return newItem;
      });
    }

    return OrderModel.findOneAndUpdate({ id: order.id }, order, {
      new: true,
      upsert: true,
    });
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

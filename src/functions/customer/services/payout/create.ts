import { OrderModel } from "~/functions/order/order.models";
import { OrderLineItem } from "~/functions/order/order.types";
import { PayoutModel, PayoutStatus } from "~/functions/payout";
import {
  PayoutLog,
  PayoutLogModel,
  PayoutLogReferenceType,
} from "~/functions/payout-log";
import { Shipping } from "~/functions/shipping/shipping.types";
import { NotFoundError } from "~/library/handler";
import { CustomerPayoutAccountServiceGet } from "../payout-account/get";
import { lineItemAggregation, shippingAggregation } from "./aggregation";

export type CustomerPayoutServiceCreateProps = {
  customerId: number;
};

export const CustomerPayoutServiceCreate = async ({
  customerId,
}: CustomerPayoutServiceCreateProps) => {
  const orders = await CustomerPayoutServiceGetLineItemsFulfilled({
    customerId,
  });

  if (orders.length === 0) {
    throw new NotFoundError([
      {
        code: "custom",
        message: "LINE_ITEMS_EMPTY",
        path: ["customerId"],
      },
    ]);
  }

  const account = await CustomerPayoutAccountServiceGet({ customerId });
  if (!account) {
    throw new NotFoundError([
      {
        code: "custom",
        message: "PAYOUT_ACCOUNT_NOT_CREATED",
        path: ["customerId"],
      },
    ]);
  }

  const totalLineItems = orders.reduce(
    (accumulator, { line_items }) => accumulator + parseFloat(line_items.price),
    0
  );

  const shippings = orders
    .filter((lineItem) => lineItem.shipping)
    .map(({ id, created_at, shipping }) => ({
      id,
      created_at,
      shipping,
    }));

  let uniqueShippings = Array.from(
    new Map(
      shippings.map((shipping) => [shipping.shipping._id.toString(), shipping])
    ).values()
  );

  const totalShippingAmount = uniqueShippings.reduce(
    (accumulator, { shipping }) => accumulator + shipping.cost.value,
    0
  );

  const payout = new PayoutModel({
    customerId,
    date: new Date(),
    amount: totalLineItems + totalShippingAmount,
    currencyCode: "DKK",
    status: PayoutStatus.PENDING,
    payoutType: account.payoutType,
    payoutDetails: account.payoutDetails,
  });

  PayoutLogModel.insertMany(
    uniqueShippings.map(
      (shipping) =>
        ({
          customerId,
          referenceId: shipping.shipping._id,
          orderId: shipping.id,
          orderCreatedAt: shipping.created_at,
          referenceType: PayoutLogReferenceType.SHIPPING,
          payout: payout._id,
        } as PayoutLog)
    )
  ).catch((error) => console.error("Error inserting shipping logs:", error)); //<< needs to send to application inisight

  PayoutLogModel.insertMany(
    orders.map(
      (lineItem) =>
        ({
          customerId,
          orderId: lineItem.id,
          orderCreatedAt: lineItem.created_at,
          referenceId: lineItem.line_items.id,
          referenceType: PayoutLogReferenceType.LINE_ITEM,
          payout: payout._id,
        } as PayoutLog)
    )
  ).catch((error) => console.error("Error inserting line item logs:", error)); //<< needs to send to application inisight

  return payout.save();
};

export const CustomerPayoutServiceGetLineItemsFulfilled = async ({
  customerId,
}: CustomerPayoutServiceCreateProps) => {
  return OrderModel.aggregate<{
    id: number;
    created_at: number;
    line_items: OrderLineItem;
    shipping: Pick<Shipping, "_id" | "cost">;
  }>([
    ...lineItemAggregation({ customerId }),
    ...shippingAggregation,
    {
      $project: {
        id: "$id",
        created_at: "$created_at",
        line_items: "$line_items",
        shipping: "$shipping",
      },
    },
  ]);
};

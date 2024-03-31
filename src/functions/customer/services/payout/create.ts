import { Shipping } from "app/lib/api/model";
import { OrderModel } from "~/functions/order/order.models";
import { OrderLineItem } from "~/functions/order/order.types";
import { PayoutModel, PayoutStatus } from "~/functions/payout";
import {
  PayoutLog,
  PayoutLogModel,
  PayoutLogReferenceType,
} from "~/functions/payout-log";
import { NotFoundError } from "~/library/handler";
import { CustomerPayoutAccountServiceGet } from "../payout-account/get";
import { lineItemAggregation, shippingAggregation } from "./aggregation";

export type CustomerPayoutServiceCreateProps = {
  customerId: number;
};

export const CustomerPayoutServiceCreate = async ({
  customerId,
}: CustomerPayoutServiceCreateProps) => {
  const lineItems = await CustomerPayoutServiceCreateGetLineItemsFulfilled({
    customerId,
  });

  if (lineItems.length === 0) {
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

  const totalAmount = lineItems.reduce(
    (accumulator, { line_items }) => accumulator + parseFloat(line_items.price),
    0
  );

  const payout = new PayoutModel({
    customerId,
    date: new Date(),
    amount: totalAmount,
    currencyCode: "DKK",
    status: PayoutStatus.PENDING,
    payoutType: account.payoutType,
    payoutDetails: account.payoutDetails,
  });

  await PayoutLogModel.insertMany(
    lineItems.map(
      (lineItem) =>
        ({
          customerId,
          referenceId: lineItem.line_items.id,
          referenceType: PayoutLogReferenceType.LINE_ITEM,
          payout: payout._id,
        } as PayoutLog)
    )
  );

  return payout.save();
};

export const CustomerPayoutServiceCreateGetLineItemsFulfilled = async ({
  customerId,
}: CustomerPayoutServiceCreateProps) => {
  return OrderModel.aggregate<{
    line_items: OrderLineItem;
    shipping: Pick<Shipping, "_id" | "cost">;
  }>([
    ...lineItemAggregation({ customerId }),
    ...shippingAggregation,
    {
      $project: {
        line_items: "$line_items",
        shipping: "$shipping",
      },
    },
  ]);
};

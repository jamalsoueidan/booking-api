import { OrderModel } from "~/functions/order/order.models";
import { PayoutModel } from "~/functions/payout";

export type CustomerPayoutServiceBalanceProps = {
  customerId: number;
};

export const CustomerPayoutServiceBalance = async ({
  customerId,
}: CustomerPayoutServiceBalanceProps) => {
  const payout = await PayoutModel.findOne({
    customerId,
  }).sort({ createdAt: -1 });

  return OrderModel.aggregate([
    {
      $match: {
        "line_items.properties.customerId": customerId,
      },
    },
    { $unwind: "$line_items" },
    {
      $match: {
        "line_items.properties.customerId": customerId,
      },
    },
    {
      $addFields: {
        refunds: {
          $filter: {
            input: "$refunds",
            as: "refund",
            cond: {
              $anyElementTrue: {
                $map: {
                  input: "$$refund.refund_line_items",
                  as: "refund_line_item",
                  in: {
                    $eq: ["$$refund_line_item.line_item_id", "$line_items.id"],
                  },
                },
              },
            },
          },
        },
        fulfillments: {
          $filter: {
            input: "$fulfillments",
            as: "fulfillment",
            cond: {
              $anyElementTrue: {
                $map: {
                  input: "$$fulfillment.line_items",
                  as: "fulfillment_line_item",
                  in: {
                    $eq: ["$$fulfillment_line_item.id", "$line_items.id"],
                  },
                },
              },
            },
          },
        },
      },
    },
    {
      $project: {
        id: 1,
        order_number: 1,
        line_items: 1,
        fulfillment_status: 1,
        financial_status: 1,
        created_at: 1,
        updated_at: 1,
        fulfillments: 1,
        refunds: 1,
      },
    },
  ]);
};

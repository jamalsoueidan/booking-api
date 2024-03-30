import { OrderModel } from "~/functions/order/order.models";

export type CustomerPayoutServiceBalanceProps = {
  customerId: number;
};

export const CustomerPayoutServiceBalance = async ({
  customerId,
}: CustomerPayoutServiceBalanceProps) => {
  const aggregationResult = await OrderModel.aggregate([
    {
      $match: {
        "line_items.properties.customerId": customerId,
      },
    },
    { $unwind: "$line_items" },
    {
      $lookup: {
        from: "PayoutLog",
        let: {
          lineItemId: "$line_items.id",
          customerId: "$line_items.properties.customerId",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$lineItemId", "$$lineItemId"] },
                  { $eq: ["$customerId", "$$customerId"] },
                ],
              },
            },
          },
        ],
        as: "payoutLog",
      },
    },
    {
      $match: {
        "line_items.properties.customerId": customerId,
        "line_items.current_quantity": 1,
        "line_items.fulfillable_quantity": 0,
        "line_items.fulfillment_status": "fulfilled",
      },
    },
    {
      $match: {
        payoutLog: { $size: 0 },
      },
    },
    {
      $group: {
        _id: null,
        totalBalancePrice: { $sum: { $toDouble: "$line_items.price" } },
      },
    },
  ]);

  if (aggregationResult.length === 0) {
    return 0; // No matching documents, so return 0
  } else {
    return aggregationResult[0].totalBalancePrice; // Return the calculated total
  }
};

import { OrderModel } from "~/functions/order/order.models";
import { lineItemAggregation, shippingAggregation } from "./aggregation";

export type CustomerPayoutServiceBalanceProps = {
  customerId: number;
};

export const CustomerPayoutServiceBalance = async ({
  customerId,
}: CustomerPayoutServiceBalanceProps) => {
  const aggregationResult = await OrderModel.aggregate([
    ...lineItemAggregation({ customerId }),
    ...shippingAggregation,
    {
      $group: {
        _id: null,
        totalBalancePrice: {
          $sum: {
            $add: [
              { $toDouble: "$line_items.price" },
              {
                $toDouble: {
                  $ifNull: ["$shipping.cost.value", 0],
                },
              },
            ],
          },
        },
      },
    },
  ]);

  if (aggregationResult.length === 0) {
    return 0;
  } else {
    return aggregationResult[0].totalBalancePrice;
  }
};

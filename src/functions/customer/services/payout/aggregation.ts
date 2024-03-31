import { PipelineStage } from "mongoose";
import { PayoutLogModel, PayoutLogReferenceType } from "~/functions/payout-log";
import { ShippingModel } from "~/functions/shipping/shipping.model";

export const lineItemAggregation = ({ customerId }: { customerId: number }) => [
  {
    $match: {
      "line_items.properties.customerId": customerId,
      "line_items.current_quantity": 1,
      "line_items.fulfillable_quantity": 0,
      "line_items.fulfillment_status": "fulfilled",
    },
  },
  { $unwind: "$line_items" },
  {
    $match: {
      "line_items.properties.customerId": customerId,
      "line_items.current_quantity": 1,
      "line_items.fulfillable_quantity": 0,
      "line_items.fulfillment_status": "fulfilled",
    },
  },
  {
    $lookup: {
      from: PayoutLogModel.collection.name,
      let: {
        referenceId: "$line_items.id",
        customerId: "$line_items.properties.customerId",
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$referenceId", "$$referenceId"] },
                { $eq: ["$customerId", "$$customerId"] },
                { $eq: ["$referenceType", PayoutLogReferenceType.LINE_ITEM] },
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
      payoutLog: { $size: 0 },
    },
  },
];

export const shippingAggregation: PipelineStage[] = [
  {
    $lookup: {
      from: ShippingModel.collection.name,
      let: { shippingId: "$line_items.properties.shippingId" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                {
                  $eq: ["$_id", { $toObjectId: "$$shippingId" }],
                },
              ],
            },
          },
        },
        {
          $project: {
            cost: 1,
          },
        },
      ],
      as: "shipping",
    },
  },
  { $unwind: "$shipping" },
  {
    $lookup: {
      from: PayoutLogModel.collection.name,
      let: {
        shippingId: { $toObjectId: "$line_items.properties.shippingId" },
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$referenceId", "$$shippingId"] },
                { $eq: ["$referenceType", PayoutLogReferenceType.SHIPPING] },
              ],
            },
          },
        },
      ],
      as: "shippingPayoutLog",
    },
  },
  {
    $addFields: {
      "shipping.cost.value": {
        $cond: {
          if: { $gt: [{ $size: "$shippingPayoutLog" }, 0] }, // Check if shipping has been paid
          then: 0, // If paid, set shipping cost value to 0
          else: {
            // If not paid, use the existing shipping cost value
            $ifNull: ["$shipping.cost.value", 0],
          },
        },
      },
    },
  },
];

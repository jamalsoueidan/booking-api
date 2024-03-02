import { PipelineStage } from "mongoose";

export const bookingAggregation: PipelineStage[] = [
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
    $sort: {
      "line_items.properties.groupId": 1,
      "line_items.properties.from": 1,
    },
  },
  {
    $group: {
      _id: "$_id",
      id: { $first: "$id" },
      line_items: { $push: "$line_items" },
      customer: { $first: "$customer" },
      orderNumber: { $first: "$order_number" },
      fulfillmentStatus: { $first: "$fulfillment_status" },
      financialStatus: { $first: "$financial_status" },
      createdAt: { $first: "$created_at" },
      updatedAt: { $first: "$updated_at" },
      cancelReason: { $first: "$cancel_reason" },
      cancelledAt: { $first: "$cancelled_at" },
      note: { $first: "$note" },
      noteAttributes: { $first: "$note_attributes" },
      fulfillmentsArray: { $push: "$fulfillments" },
      refundsArray: { $push: "$refunds" },
    },
  },
  {
    $addFields: {
      locationId: { $first: "$line_items.properties.locationId" },
      shippingId: { $first: "$line_items.properties.shippingId" },
      groupId: { $first: "$line_items.properties.groupId" },
      end: { $last: "$line_items.properties.to" },
      start: { $first: "$line_items.properties.from" },
    },
  },
  {
    $lookup: {
      from: "Location",
      let: { locationId: "$locationId" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                {
                  $eq: ["$_id", { $toObjectId: "$$locationId" }],
                },
              ],
            },
          },
        },
        {
          $project: {
            name: 1,
            fullAddress: 1,
            originType: 1,
            locationType: 1,
          },
        },
      ],
      as: "location",
    },
  },
  {
    $unwind: {
      path: "$location",
      preserveNullAndEmptyArrays: true, // Set to false if you always expect a match
    },
  },
  {
    $lookup: {
      from: "Shipping",
      let: { shippingId: "$shippingId" },
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
            origin: 1,
            destination: 1,
            duration: 1,
            distance: 1,
            cost: 1,
          },
        },
      ],
      as: "shipping",
    },
  },
  {
    $unwind: {
      path: "$shipping",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $addFields: {
      start: {
        $cond: {
          if: { $gt: ["$shipping.duration.value", 0] },
          then: {
            $dateSubtract: {
              startDate: "$start",
              unit: "minute",
              amount: { $toInt: "$shipping.duration.value" },
            },
          },
          else: "$start",
        },
      },
      end: {
        $cond: {
          if: { $gt: ["$shipping.duration.value", 0] },
          then: {
            $dateAdd: {
              startDate: "$end",
              unit: "minute",
              amount: { $toInt: "$shipping.duration.value" },
            },
          },
          else: "$end",
        },
      },
    },
  },
  {
    $project: {
      id: 1,
      start: 1,
      end: 1,
      shipping: 1,
      user: 1,
      groupId: 1,
      location: 1,
      line_items: 1,
      customer: 1,
      orderNumber: 1,
      fulfillmentStatus: 1,
      financialStatus: 1,
      createdAt: 1,
      updatedAt: 1,
      cancelReason: 1,
      cancelledAt: 1,
      note: 1,
      noteAttributes: 1,
      fulfillments: {
        $reduce: {
          input: "$fulfillmentsArray",
          initialValue: [],
          in: { $concatArrays: ["$$value", "$$this"] },
        },
      },
      refunds: {
        $reduce: {
          input: "$refundsArray",
          initialValue: [],
          in: { $concatArrays: ["$$value", "$$this"] },
        },
      },
    },
  },
];

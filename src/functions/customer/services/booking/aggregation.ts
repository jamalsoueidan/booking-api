import { PipelineStage } from "mongoose";

export const bookingAggregation: PipelineStage[] = [
  {
    $sort: {
      "line_items.properties.groupId": 1,
      "line_items.properties.from": 1,
    },
  },
  {
    $group: {
      _id: "$line_items.properties.groupId",
      id: { $first: "$id" },
      line_items: { $push: "$line_items" },
      customer: { $first: "$customer" },
      order_number: { $first: "$order_number" },
      fulfillment_status: { $first: "$fulfillment_status" },
      financial_status: { $first: "$financial_status" },
      created_at: { $first: "$created_at" },
      updated_at: { $first: "$updated_at" },
      cancel_reason: { $first: "$cancel_reason" },
      cancelled_at: { $first: "$cancelled_at" },
      note: { $first: "$note" },
      note_attributes: { $first: "$note_attributes" },
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
      order_number: 1,
      fulfillment_status: 1,
      financial_status: 1,
      created_at: 1,
      updated_at: 1,
      cancel_reason: 1,
      cancelled_at: 1,
      note: 1,
      note_attributes: 1,
    },
  },
];

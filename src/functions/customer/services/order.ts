import { OrderModel } from "~/functions/order/order.models";

export type CustomerOrderServiceListProps = {
  customerId: number;
  year: number;
  month: number;
};

export const CustomerOrderServiceList = async ({
  customerId,
  year,
  month,
}: CustomerOrderServiceListProps) => {
  const firstDayOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const lastDayOfMonth = new Date(Date.UTC(year, month, 0));

  return OrderModel.aggregate([
    {
      $match: {
        $and: [
          {
            "line_items.properties": {
              $elemMatch: { name: "_customerId", value: customerId },
            },
          },
          {
            "line_items.properties": {
              $elemMatch: {
                name: "_from",
                value: {
                  $gte: firstDayOfMonth,
                  $lte: lastDayOfMonth,
                },
              },
            },
          },
        ],
      },
    },
    { $unwind: "$line_items" },
    {
      $match: {
        $and: [
          {
            "line_items.properties": {
              $elemMatch: { name: "_customerId", value: customerId },
            },
          },
          {
            "line_items.properties": {
              $elemMatch: {
                name: "_from",
                value: {
                  $gte: firstDayOfMonth,
                  $lte: lastDayOfMonth,
                },
              },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        "line_items._from": {
          $reduce: {
            input: "$line_items.properties",
            initialValue: null,
            in: {
              $cond: {
                if: { $eq: ["$$this.name", "_from"] },
                then: "$$this.value",
                else: "$$value",
              },
            },
          },
        },
      },
    },
    {
      $sort: { "line_items._from": 1 }, // 1 for ascending order, -1 for descending
    },
    {
      $addFields: {
        "line_items.refunds": {
          $map: {
            input: {
              $filter: {
                input: {
                  $reduce: {
                    input: "$refunds",
                    initialValue: [],
                    in: {
                      $concatArrays: ["$$value", "$$this.refund_line_items"],
                    },
                  },
                },
                as: "refund_line_item",
                cond: {
                  $eq: ["$$refund_line_item.line_item_id", "$line_items._id"],
                },
              },
            },
            as: "refund",
            in: {
              _id: "$$refund._id",
              line_item_id: "$$refund.line_item_id",
              location_id: "$$refund.location_id",
              quantity: "$$refund.quantity",
              restock_type: "$$refund.restock_type",
              subtotal: "$$refund.subtotal",
              subtotal_set: "$$refund.subtotal_set",
              total_tax: "$$refund.total_tax",
              total_tax_set: "$$refund.total_tax_set",
            },
          },
        },
      },
    },
    {
      $addFields: {
        "line_items.fulfillments": {
          $cond: {
            if: { $eq: [{ $size: "$line_items.refunds" }, 0] },
            then: {
              $filter: {
                input: {
                  $reduce: {
                    input: "$fulfillments",
                    initialValue: [],
                    in: { $concatArrays: ["$$value", "$$this.line_items"] },
                  },
                },
                as: "fulfillment_line_item",
                cond: {
                  $eq: ["$$fulfillment_line_item._id", "$line_items._id"],
                },
              },
            },
            else: [],
          },
        },
      },
    },
    {
      $project: {
        id: 1,
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
  ]);
};

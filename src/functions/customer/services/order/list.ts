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
        refunds: {
          $map: {
            input: {
              $filter: {
                input: "$refunds",
                as: "refund",
                cond: {
                  $anyElementTrue: {
                    $map: {
                      input: "$$refund.refund_line_items",
                      as: "refund_refund_line_items",
                      in: {
                        $eq: [
                          "$$refund_refund_line_items.line_item_id",
                          "$line_items._id",
                        ],
                      },
                    },
                  },
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
        fulfillments: {
          $map: {
            input: {
              $filter: {
                input: "$fulfillments",
                as: "fulfillment",
                cond: {
                  $anyElementTrue: {
                    $map: {
                      input: "$$fulfillment.line_items",
                      as: "fulfillment_line_item",
                      in: {
                        $eq: ["$$fulfillment_line_item._id", "$line_items._id"],
                      },
                    },
                  },
                },
              },
            },
            as: "fulfillment",
            in: {
              _id: "$$fulfillment._id",
              admin_graphql_api_id: "$$fulfillment.admin_graphql_api_id",
              created_at: "$$fulfillment.created_at",
              location_id: "$$fulfillment.location_id",
              name: "$$fulfillment.name",
              order_id: "$$fulfillment.order_id",
              service: "$$fulfillment.service",
              shipment_status: "$$fulfillment.shipment_status",
              status: "$$fulfillment.status",
              tracking_company: "$$fulfillment.tracking_company",
              tracking_number: "$$fulfillment.tracking_number",
              tracking_numbers: "$$fulfillment.tracking_numbers",
              tracking_url: "$$fulfillment.tracking_url",
              tracking_urls: "$$fulfillment.tracking_urls",
              updated_at: "$$fulfillment.updated_at",
            },
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
        fulfillments: 1,
        refunds: 1,
      },
    },
  ]);
};

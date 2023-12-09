import { OrderModel } from "~/functions/order/order.models";
import { NotFoundError } from "~/library/handler";
import { CustomerOrderServiceListAggregate } from "./list";

export type CustomerOrderServiceGetProps = {
  customerId: number;
  lineItemId: number;
};

export const CustomerOrderServiceGet = async ({
  customerId,
  lineItemId,
}: CustomerOrderServiceGetProps) => {
  const orders = await OrderModel.aggregate<CustomerOrderServiceListAggregate>([
    {
      $match: {
        $and: [
          {
            "line_items.properties": {
              $elemMatch: { name: "_customerId", value: customerId },
            },
          },
          {
            line_items: {
              $elemMatch: { id: lineItemId },
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
            "line_items.id": lineItemId,
          },
        ],
      },
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
                      as: "refund_line_item",
                      in: {
                        $eq: [
                          "$$refund_line_item.line_item_id",
                          "$line_items.id",
                        ],
                      },
                    },
                  },
                },
              },
            },
            as: "filtered_refund",
            in: {
              id: "$$filtered_refund.id",
              admin_graphql_api_id: "$$filtered_refund.admin_graphql_api_id",
              created_at: "$$filtered_refund.created_at",
              note: "$$filtered_refund.note",
              order_id: "$$filtered_refund.order_id",
              processed_at: "$$filtered_refund.processed_at",
              restock: "$$filtered_refund.restock",
              total_duties_set: "$$filtered_refund.total_duties_set",
              user_id: "$$filtered_refund.user_id",
              order_adjustments: "$$filtered_refund.order_adjustments",
              transactions: "$$filtered_refund.transactions",
              duties: "$$filtered_refund.duties",
              refund_line_items: {
                $map: {
                  input: "$$filtered_refund.refund_line_items",
                  as: "refund_line_item",
                  in: {
                    id: "$$refund_line_item.id",
                    line_item_id: "$$refund_line_item.line_item_id",
                    location_id: "$$refund_line_item.location_id",
                    quantity: "$$refund_line_item.quantity",
                    restock_type: "$$refund_line_item.restock_type",
                    subtotal: "$$refund_line_item.subtotal",
                    subtotal_set: "$$refund_line_item.subtotal_set",
                    total_tax: "$$refund_line_item.total_tax",
                    total_tax_set: "$$refund_line_item.total_tax_set",
                    // Excluding the 'line_item' field
                  },
                },
              },
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
                        $eq: ["$$fulfillment_line_item.id", "$line_items.id"],
                      },
                    },
                  },
                },
              },
            },
            as: "fulfillment",
            in: {
              id: "$$fulfillment.id",
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
              // Excluding the 'line_items' field
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

  if (orders.length === 0) {
    throw new NotFoundError([
      {
        code: "custom",
        message: "ORDER_NOT_FOUND",
        path: ["lineItemId"],
      },
    ]);
  }

  return orders[0];
};

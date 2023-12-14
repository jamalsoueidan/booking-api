import { z } from "zod";
import { ShippingServiceGet } from "~/functions/shipping/services/get";
import { _ } from "~/library/handler";
import { NumberOrStringType } from "~/library/zod";
import { CustomerLocationServiceGetOne } from "../../services/location";
import { CustomerOrderServiceGetLineItem } from "../../services/order/get-lineitem";
import { CustomerProductServiceGet } from "../../services/product";

export type CustomerOrderControllerGetLineItemRequest = {
  query: z.infer<typeof CustomerOrderControllerGetLineItemSchema>;
};

export const CustomerOrderControllerGetLineItemSchema = z.object({
  customerId: NumberOrStringType,
  lineItemId: NumberOrStringType,
});

export type CustomerOrderControllerGetLineItemResponse = Awaited<
  ReturnType<typeof CustomerOrderServiceGetLineItem>
>;

export const CustomerOrderControllerGetLineItem = _(
  async ({ query }: CustomerOrderControllerGetLineItemRequest) => {
    const validateData = CustomerOrderControllerGetLineItemSchema.parse(query);

    // Should we use lookup to get product,location,shippingId?
    const order = await CustomerOrderServiceGetLineItem(validateData);

    const product = await CustomerProductServiceGet({
      productId: order.line_items.product_id,
      customerId: order.line_items.properties?.customerId!,
    });

    const location = await CustomerLocationServiceGetOne({
      customerId: order.line_items.properties?.customerId!,
      locationId: order.line_items.properties?.locationId,
    });

    const shippingId = order.line_items.properties?.shippingId;
    const shipping = shippingId
      ? await ShippingServiceGet({
          shippingId: shippingId,
        })
      : null;

    return {
      order,
      product: {
        selectedOptions: product.selectedOptions,
      },
      location,
      shipping,
    };
  }
);

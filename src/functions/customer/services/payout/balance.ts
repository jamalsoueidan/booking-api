import { CustomerPayoutServiceGetLineItemsFulfilled } from "./create";

export type CustomerPayoutServiceBalanceProps = {
  customerId: number;
};

export const CustomerPayoutServiceBalance = async ({
  customerId,
}: CustomerPayoutServiceBalanceProps) => {
  const lineItems = await CustomerPayoutServiceGetLineItemsFulfilled({
    customerId,
  });

  const totalLineItems = lineItems.reduce(
    (accumulator, { line_items }) => accumulator + parseFloat(line_items.price),
    0
  );

  const shippings = lineItems
    .filter((lineItem) => lineItem.shipping)
    .map(({ shipping }) => shipping);

  let uniqueShippings = Array.from(
    new Map(
      shippings.map((shipping) => [shipping._id.toString(), shipping])
    ).values()
  );

  const totalShippingAmount = uniqueShippings.reduce(
    (accumulator, { cost }) => accumulator + cost.value,
    0
  );

  return {
    totalAmount: totalLineItems + totalShippingAmount,
    totalLineItems,
    totalShippingAmount,
  };
};

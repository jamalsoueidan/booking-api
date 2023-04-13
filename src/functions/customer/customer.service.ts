import { ShopifyServiceSearchCustomers } from "~/functions/shopify";
import { CustomerModel } from "./customer.model";
import { CustomerServiceFindAndUpdateProps } from "./customer.types";

export const CustomerServiceFindAndUpdate = async ({
  customerGraphqlApiId,
  customerId,
}: CustomerServiceFindAndUpdateProps) => {
  const customers = await ShopifyServiceSearchCustomers({
    keyword: customerGraphqlApiId,
    limit: 1,
  });
  if (!customers?.length) {
    console.log("no customer found");
  }

  const customer = customers[0];
  //const customerId = ShopifyHelperGetId(customer.id);

  return CustomerModel.findOneAndUpdate(
    { customerId },
    {
      customerId,
      ...customer,
    },
    { new: true, upsert: true }
  );
};

import { ShopifyServiceSearchCustomers } from "~/functions/shopify";
import { NotFoundError } from "~/library/handler";
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
    throw new NotFoundError([
      {
        path: ["customers"],
        message: "NOT_FOUND",
        code: "custom",
      },
    ]);
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

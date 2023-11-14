import { z } from "zod";
import { _ } from "~/library/handler";

import { CustomerProductsServiceList } from "~/functions/customer/services/product";
import { UserServiceGet } from "~/functions/user";

export type UserProductsControllerListRequest = {
  query: z.infer<typeof UserProductsControllerListSchema>;
};

export const UserProductsControllerListSchema = z.object({
  username: z.string(),
  scheduleId: z.string().optional(),
});

export type UserProductsControllerListResponse = Awaited<
  ReturnType<typeof CustomerProductsServiceList>
>;

export const UserProductsControllerList = _(
  async ({ query }: UserProductsControllerListRequest) => {
    const validateData = UserProductsControllerListSchema.parse(query);
    const user = await UserServiceGet(validateData);
    return CustomerProductsServiceList({
      customerId: user.customerId,
      scheduleId: validateData.scheduleId,
    });
  }
);

import { z } from "zod";
import { CustomerProductServiceGet } from "~/functions/customer/services/product";

import { ScheduleProductZodSchema } from "~/functions/schedule/schedule.types";
import { _ } from "~/library/handler";
import { UserServiceGetCustomerId } from "../../services/user";

export type UserProductsControllerGetRequest = {
  query: z.infer<typeof UserProductsControllerGetQuerySchema>;
};

const UserProductsControllerGetQuerySchema = z.object({
  username: z.string(),
  productId: ScheduleProductZodSchema.shape.productId,
});

export type UserProductsControllerGetResponse = Awaited<
  ReturnType<typeof CustomerProductServiceGet>
>;

export const UserProductsControllerGet = _(
  async ({ query }: UserProductsControllerGetRequest) => {
    const validateQuery = UserProductsControllerGetQuerySchema.parse(query);
    const user = await UserServiceGetCustomerId({
      username: validateQuery.username,
    });
    return CustomerProductServiceGet({
      customerId: user.customerId,
      productId: validateQuery.productId,
    });
  }
);

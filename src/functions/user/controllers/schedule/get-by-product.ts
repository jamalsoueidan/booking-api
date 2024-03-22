import { z } from "zod";

import { _ } from "~/library/handler";
import { UserScheduleServiceGetByProductId as UserScheduleServiceGetByProduct } from "../../services/schedule/get-by-product";
import { UserServiceGetCustomerId } from "../../services/user/get-customer-id";

export type UserScheduleControllerGetByProductRequest = {
  query: z.infer<typeof UserScheduleControllerGetByProductQuerySchema>;
};

const UserScheduleControllerGetByProductQuerySchema = z.object({
  username: z.string(),
  productHandle: z.string(),
});

export type UserScheduleControllerGetByProductResponse = Awaited<
  ReturnType<typeof UserScheduleServiceGetByProduct>
>;

export const UserScheduleControllerGetByProduct = _(
  async ({ query }: UserScheduleControllerGetByProductRequest) => {
    const validateQuery =
      UserScheduleControllerGetByProductQuerySchema.parse(query);
    const user = await UserServiceGetCustomerId(validateQuery);
    return UserScheduleServiceGetByProduct({
      productHandle: validateQuery.productHandle,
      customerId: user.customerId,
    });
  }
);

import { z } from "zod";

import { _ } from "~/library/handler";
import { NumberOrStringType } from "~/library/zod";
import { UserScheduleServiceGetByProductId as UserScheduleServiceGetByProduct } from "../../services/schedule/get-by-product";
import { UserServiceGetCustomerId } from "../../services/user";

export type UserScheduleControllerGetByProductRequest = {
  query: z.infer<typeof UserScheduleControllerGetByProductQuerySchema>;
};

const UserScheduleControllerGetByProductQuerySchema = z.object({
  username: z.string(),
  productId: NumberOrStringType,
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
      productId: validateQuery.productId,
      customerId: user.customerId,
    });
  }
);

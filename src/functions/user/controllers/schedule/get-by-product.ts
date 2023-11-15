import { z } from "zod";

import { _ } from "~/library/handler";
import { NumberOrStringType } from "~/library/zod";
import { UserScheduleServiceGetByProductId } from "../../services/schedule/get-by-product";
import { UserServiceGetCustomerId } from "../../services/user";

export type UserScheduleControllerGetByProductIdRequest = {
  query: z.infer<typeof UserScheduleControllerGetByProductIdQuerySchema>;
};

const UserScheduleControllerGetByProductIdQuerySchema = z.object({
  username: z.string(),
  productId: NumberOrStringType,
});

export type UserScheduleControllerGetByProductIdResponse = Awaited<
  ReturnType<typeof UserScheduleServiceGetByProductId>
>;

export const UserScheduleControllerGetByProductId = _(
  async ({ query }: UserScheduleControllerGetByProductIdRequest) => {
    const validateQuery =
      UserScheduleControllerGetByProductIdQuerySchema.parse(query);
    const user = await UserServiceGetCustomerId(validateQuery);
    return UserScheduleServiceGetByProductId({
      productId: validateQuery.productId,
      customerId: user.customerId,
    });
  }
);

import { z } from "zod";
import { _ } from "~/library/handler";

import { CustomerProductsServiceList } from "~/functions/customer/services/product/list";
import { UserServiceGetCustomerId } from "../../services/user/get-customer-id";

export type UserProductsControllerListByScheduleRequest = {
  query: z.infer<typeof UserProductsControllerListByScheduleSchema>;
};

export const UserProductsControllerListByScheduleSchema = z.object({
  username: z.string(),
  scheduleId: z.string().optional(),
});

export type UserProductsControllerListByScheduleResponse = Awaited<
  ReturnType<typeof CustomerProductsServiceList>
>;

export const UserProductsControllerListBySchedule = _(
  async ({ query }: UserProductsControllerListByScheduleRequest) => {
    const validateData =
      UserProductsControllerListByScheduleSchema.parse(query);
    const user = await UserServiceGetCustomerId(validateData);
    return CustomerProductsServiceList({
      customerId: user.customerId,
      scheduleId: validateData.scheduleId,
    });
  }
);

import { _ } from "~/library/handler";

import { CustomerServiceList } from "../../services";

export type CustomerControllerListRequest = {};

export type CustomerControllerListResponse = Awaited<
  ReturnType<typeof CustomerServiceList>
>;

export const CustomerControllerList = _(async () => {
  return CustomerServiceList();
});

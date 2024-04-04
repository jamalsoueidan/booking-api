import { _ } from "~/library/handler";

import { z } from "zod";
import { UserServiceFilters } from "../../services/user/filters";

export type UserControllerFiltersRequest = {
  query: z.infer<typeof UserControllerFiltersQuerySchema>;
};

export const UserControllerFiltersQuerySchema = z.object({
  profession: z.string().optional(),
});

export type UserControllerFiltersResponse = Awaited<
  ReturnType<typeof UserServiceFilters>
>;

export const UserControllerFilters = _(
  async ({ query }: UserControllerFiltersRequest) => {
    const queryValidate = UserControllerFiltersQuerySchema.parse(query);
    return UserServiceFilters(queryValidate);
  }
);

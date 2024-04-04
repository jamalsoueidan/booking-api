import { _ } from "~/library/handler";

import { z } from "zod";
import { UserServiceSearch } from "../../services/user/search";

export type UserControllerSearchRequest = {
  query: z.infer<typeof UserControllerSearchQuerySchema>;
};

export const UserControllerSearchQuerySchema = z.object({
  search: z.string(),
});

export type UserControllerSearchResponse = Awaited<
  ReturnType<typeof UserServiceSearch>
>;

export const UserControllerSearch = _(
  async ({ query }: UserControllerSearchRequest) => {
    const queryValidate = UserControllerSearchQuerySchema.parse(query);
    return UserServiceSearch(queryValidate);
  }
);

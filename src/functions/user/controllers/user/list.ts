import { _ } from "~/library/handler";

import { z } from "zod";
import { CommaSeparatedArray, NumberOrStringType } from "~/library/zod";
import { UserServiceList } from "../../services/user/list";

export type UserControllerListRequest = {
  query: z.infer<typeof UserControllerListSchema>;
};

enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

export const UserControllerListSchema = z.object({
  nextCursor: z.string().optional(),
  limit: NumberOrStringType.optional(),
  profession: z.string().optional(),
  specialties: CommaSeparatedArray.optional(),
  sortOrder: z.nativeEnum(SortOrder).optional(),
});

export type UserControllerListResponse = Awaited<
  ReturnType<typeof UserServiceList>
>;

export const UserControllerList = _(
  async ({ query }: UserControllerListRequest) => {
    const validateData = UserControllerListSchema.parse(query);
    return UserServiceList(validateData);
  }
);

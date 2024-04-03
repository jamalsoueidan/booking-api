import { _ } from "~/library/handler";

import { z } from "zod";
import { CommaSeparatedArray, NumberOrStringType } from "~/library/zod";
import { UserServiceList } from "../../services/user/list";
import { Professions } from "../../user.types";

export type UserControllerListRequest = {
  query: z.infer<typeof UserControllerListQuerySchema>;
  body: z.infer<typeof UserControllerListBodySchema>;
};

enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

export const UserControllerListQuerySchema = z.object({
  nextCursor: z.string().optional(),
  limit: NumberOrStringType.optional(),
  sortOrder: z.nativeEnum(SortOrder).optional(),
});

export const UserControllerListBodySchema = z.object({
  profession: z.nativeEnum(Professions).optional(),
  specialties: CommaSeparatedArray.optional(),
  location: z
    .object({
      city: z.string(),
    })
    .optional(),
});

export type UserControllerListResponse = Awaited<
  ReturnType<typeof UserServiceList>
>;

export const UserControllerList = _(
  async ({ query, body }: UserControllerListRequest) => {
    const queryValidate = UserControllerListQuerySchema.parse(query);
    const bodyValidate = UserControllerListBodySchema.parse(body);
    return UserServiceList({
      limit: 10,
      ...queryValidate,
      filters: bodyValidate,
    });
  }
);

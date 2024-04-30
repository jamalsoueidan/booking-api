import { _ } from "~/library/handler";

import { z } from "zod";
import { LocationZodSchema } from "~/functions/location";
import { SlotWeekDays } from "~/functions/schedule";
import { CommaSeparatedArray, NumberOrString } from "~/library/zod";
import { UserServiceSearch } from "../../services/user/search";
import { Professions } from "../../user.types";

export type UserControllerSearchRequest = {
  query: z.infer<typeof UserControllerSearchQuerySchema>;
  body: z.infer<typeof UserControllerSearchBodySchema>;
};

enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

export const UserControllerSearchQuerySchema = z
  .object({
    nextCursor: z.string().optional(),
    limit: NumberOrString.optional(),
    sortOrder: z.nativeEnum(SortOrder).optional(),
  })
  .strip();

export const UserControllerSearchBodySchema = z
  .object({
    keyword: z.string().optional(),
    profession: z.nativeEnum(Professions).optional(),
    specialties: CommaSeparatedArray.optional(),
    location: LocationZodSchema.pick({
      city: true,
      locationType: true,
    }).optional(),
    days: z.array(z.nativeEnum(SlotWeekDays)).optional(),
  })
  .strip()
  .optional();

export type UserControllerSearchResponse = Awaited<
  ReturnType<typeof UserServiceSearch>
>;

export const UserControllerSearch = _(
  async ({ query, body }: UserControllerSearchRequest) => {
    const queryValidate = UserControllerSearchQuerySchema.parse(query);
    const bodyValidate = UserControllerSearchBodySchema.parse(body);
    return UserServiceSearch({
      limit: 10,
      ...queryValidate,
      filters: bodyValidate,
    });
  }
);

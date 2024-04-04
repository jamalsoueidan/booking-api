import { _ } from "~/library/handler";

import { z } from "zod";
import { UserServiceFiltersSpecialties } from "../../services/user/filters/specialties";

export type UserControllerSpecialtiesRequest = {
  query: z.infer<typeof UserControllerSpecialtiesSchema>;
};

export const UserControllerSpecialtiesSchema = z.object({
  profession: z.string(),
});

export type UserControllerSpecialtiesResponse = Awaited<
  ReturnType<typeof UserServiceFiltersSpecialties>
>;

export const UserControllerSpecialties = _(
  async ({ query }: UserControllerSpecialtiesRequest) => {
    const validateData = UserControllerSpecialtiesSchema.parse(query);
    return UserServiceFiltersSpecialties(validateData);
  }
);

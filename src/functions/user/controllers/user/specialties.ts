import { _ } from "~/library/handler";

import { z } from "zod";
import { UserServiceSpecialties } from "../../services/user/specialties";

export type UserControllerSpecialtiesRequest = {
  query: z.infer<typeof UserControllerSpecialtiesSchema>;
};

export const UserControllerSpecialtiesSchema = z.object({
  profession: z.string(),
});

export type UserControllerSpecialtiesResponse = Awaited<
  ReturnType<typeof UserServiceSpecialties>
>;

export const UserControllerSpecialties = _(
  async ({ query }: UserControllerSpecialtiesRequest) => {
    const validateData = UserControllerSpecialtiesSchema.parse(query);
    return UserServiceSpecialties(validateData);
  }
);

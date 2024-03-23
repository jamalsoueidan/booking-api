import { z } from "zod";
import { _ } from "~/library/handler";
import { UserServiceUsernameTaken } from "../../services/user/username-taken";

export type UserControllerUsernameTakenRequest = {
  query: z.infer<typeof UserControllerUsernameTakenSchema>;
};

export const UserControllerUsernameTakenSchema = z.object({
  username: z.string(),
});

export type UserControllerUsernameTakenResponse = Awaited<
  ReturnType<typeof UserServiceUsernameTaken>
>;

export const UserControllerUsernameTaken = _(
  async ({ query }: UserControllerUsernameTakenRequest) => {
    const validateData = UserControllerUsernameTakenSchema.parse(query);
    return UserServiceUsernameTaken(validateData);
  }
);

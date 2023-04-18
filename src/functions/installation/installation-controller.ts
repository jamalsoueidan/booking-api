import { z } from "zod";
import { AuthRole } from "~/functions/auth";
import { UserModel, UserServiceCreate, UserZodSchema } from "~/functions/user";
import { ForbiddenError, _ } from "~/library/handler";

export type InstallationControllerGetStatusResponse = {
  done: boolean;
};

export const InstallationControllerGetStatus = _(async () => {
  const users = await UserModel.find().lean();
  return {
    done: users.length > 0,
  };
});

export type InstallationControllerSetupRequest = {
  body: z.infer<typeof InstallationControllerSetupBodySchema>;
};

export const InstallationControllerSetupBodySchema = UserZodSchema.omit({
  _id: true,
});

export type InstallationControllerSetupResponse = boolean;

export const InstallationControllerSetup = _(
  async ({ body }: InstallationControllerSetupRequest) => {
    const users = await UserModel.find().lean();
    if (users.length > 0) {
      throw new ForbiddenError([
        { path: ["setup"], message: "NOT_ALLOWED", code: "custom" },
      ]);
    }

    const validateBody = InstallationControllerSetupBodySchema.parse(body);
    await UserServiceCreate({ ...validateBody, active: true }, AuthRole.owner);
    return true;
  }
);

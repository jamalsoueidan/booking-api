import { z } from "zod";
import { _ } from "~/library/handler";
import { OpenAIServiceProfile } from "../services/profile";

export type OpenAIControllerProfileRequest = {
  body: z.infer<typeof OpenAIControllerProfileSchema>;
};

export const OpenAIControllerProfileSchema = z.object({
  professions: z.array(z.string()),
  skills: z.array(z.string()),
  userDetails: z.object({}),
});

export type OpenaiProductCategorizeResponse = Awaited<
  ReturnType<typeof OpenAIControllerProfile>
>;

export const OpenAIControllerProfile = _(
  ({ body }: OpenAIControllerProfileRequest) => {
    const validateBody = OpenAIControllerProfileSchema.parse(body);
    return OpenAIServiceProfile(validateBody);
  }
);

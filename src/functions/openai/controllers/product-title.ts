import { z } from "zod";
import { _ } from "~/library/handler";
import { OpenAIServiceProductTitle } from "../services/product-title";

export type OpenAIControllerProductTitleRequest = {
  body: z.infer<typeof OpenAIControllerProductTitleSchema>;
};

export const OpenAIControllerProductTitleSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
});

export type OpenaiProductCategorizeResponse = Awaited<
  ReturnType<typeof OpenAIControllerProductTitle>
>;

export const OpenAIControllerProductTitle = _(
  ({ body }: OpenAIControllerProductTitleRequest) => {
    const validateBody = OpenAIControllerProductTitleSchema.parse(body);
    return OpenAIServiceProductTitle(validateBody);
  }
);

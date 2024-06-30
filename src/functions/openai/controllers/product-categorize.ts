import { z } from "zod";
import { _ } from "~/library/handler";
import { OpenAIServiceProductCategorize } from "../services/product-categorize";

export type OpenAIControllerProductCategorizeRequest = {
  body: z.infer<typeof OpenAIServiceProductCategorizeSchema>;
};

export const OpenAIServiceProductCategorizeSchema = z.object({
  title: z.string(),
  description: z.string(),
});

export type OpenaiProductCategorizeResponse = Awaited<
  ReturnType<typeof OpenAIServiceProductCategorize>
>;

export const OpenAIControllerProductCategorize = _(
  ({ body }: OpenAIControllerProductCategorizeRequest) => {
    const validateBody = OpenAIServiceProductCategorizeSchema.parse(body);
    return OpenAIServiceProductCategorize(validateBody);
  }
);

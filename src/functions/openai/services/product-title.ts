import OpenAI from "openai";
import { shopifyAdmin } from "~/library/shopify";
import { COLLECTIONS } from "./product-categorize";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type OpenAIServiceProductTitleReturn = {
  collection: {
    id: string;
    title: string;
  };
  title: string;
  description: string;
};

export const OpenAIServiceProductTitle = async ({
  title,
  description,
}: {
  title: string;
  description?: string;
}) => {
  const { data } = await shopifyAdmin().request(COLLECTIONS);

  const onlyRootcollections = data?.collections.nodes.filter(
    (col: any) => col.ruleSet.rules.length > 1
  );

  const collectionsContext = JSON.stringify(onlyRootcollections, null, 2);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-2024-05-13",
    messages: [
      {
        role: "system",
        content: `
You are an expert in correcting treatment titles and descriptions.
Please correct any grammatical errors in title and description. If the description is missing, add a short sentence that encourages customers to buy this treatment, the text should be from the indiviual beauty professional as seller of the treatment.
Also figure out the collection the treatment belongs to.
### Collections
${collectionsContext}

Respond with this JSON structure, and choose danish language for title and description.
{
  "collection": {
    id: "gid://shopify/Collection/1111",
    title: "example",
  },
  title: "example",
  description: "example",
}`,
      },
      {
        role: "user",
        content: `Title: ${title}\nDescription: ${description || ""}`,
      },
    ],
    max_tokens: 500,
    response_format: {
      type: "json_object",
    },
  });

  return JSON.parse(
    response.choices[0].message.content as any
  ) as OpenAIServiceProductTitleReturn;
};

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type OpenAIServiceProductTitleReturn = {
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
  const response = await openai.chat.completions.create({
    model: "gpt-4o-2024-05-13",
    messages: [
      {
        role: "system",
        content: `You are an expert in correcting treatment titles and descriptions. Please correct any grammatical errors in title and description. If the description is missing, add a short sentence that encourages customers to buy the product. Please responds with title, description json format and keep the language in danish.`,
      },
      {
        role: "user",
        content: `Title: ${title}\nDescription: ${description || ""}`,
      },
    ],
    max_tokens: 100,
    response_format: {
      type: "json_object",
    },
  });

  return JSON.parse(
    response.choices[0].message.content as any
  ) as OpenAIServiceProductTitleReturn;
};

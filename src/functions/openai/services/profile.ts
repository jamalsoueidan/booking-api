import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type OpenAIServiceProfile = {
  professions: string[];
  skills: string[];
  aboutMe: string;
  shortDescription: string;
};

export const OpenAIServiceProfile = async ({
  professions,
  skills,
  user,
  products,
}: {
  professions: string[];
  skills: string[];
  user?: any;
  products: Array<any>;
}) => {
  try {
    const content = `
You are an assistant helping a beauty professional create a user profile on a beauty platform.

### Professions to choose from:
${JSON.stringify(professions, null, 2)}

### Skills to choose from:
${JSON.stringify(skills, null, 2)}

### User Details:
${JSON.stringify(user, null, 2)}

### User products details:
${JSON.stringify(products, null, 2)}

Write a short description and an about me section in Danish.
Choose user professions from the list above based on the user offering services. Only choose professions and skills related to the provided services.

Respond with this JSON structure:

{
  "professions": [...],
  "skills": [...],
  "shortDescription": '',
  "aboutMe": ''
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-2024-05-13",
      messages: [
        {
          role: "system",
          content,
        },
      ],
      max_tokens: 1000,
      response_format: {
        type: "json_object",
      },
    });

    return JSON.parse(
      response.choices[0].message.content as any
    ) as OpenAIServiceProfile;
  } catch (error) {
    console.error("Error:", error);
  }
};

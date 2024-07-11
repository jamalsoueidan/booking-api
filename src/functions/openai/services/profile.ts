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
  userDetails,
}: {
  professions: any;
  skills: any;
  userDetails: any;
}) => {
  try {
    const content = `
You are an assistant helping to create a user profile for a beauty professional. Use the provided information about the user's profession, skills, and other details to fill out the profile in the specified JSON format. Ensure the information is concise, accurate, and professional.

### Professions to choose from:
${JSON.stringify(professions, null, 2)}

### Skills to choose from:
${JSON.stringify(skills, null, 2)}

### User Details:
${JSON.stringify(userDetails, null, 2)}

The profession and skills should be determined based on the products offered. For example:
- If the products are related to hair styling, hair coloring, or bridal hair, select the profession as "hair_stylist" and relevant skills such as "balayage_specialist", "hair_coloring", and "bridal_makeup".

Write a short description and an about me section in Danish.

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

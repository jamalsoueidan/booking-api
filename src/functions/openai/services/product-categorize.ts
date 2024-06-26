import OpenAI from "openai";
import { shopifyAdmin } from "~/library/shopify";
import { CollectionsQuery } from "~/types/admin.generated";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const OpenAIServiceProductCategorize = async ({
  title,
  description,
}: {
  title: string;
  description?: string;
}) => {
  try {
    const { data } = await shopifyAdmin().request(COLLECTIONS);

    const collectionsContext = JSON.stringify(data?.collections.nodes, null, 2);

    const content = `
### Product Details:
Product Title: ${title}
Product Description: ${description}.

Identify all collections that best fit the product title from the given collections. Consider the type of service or product described in the title and find all relevant collections. Avoid including collections that are not contextually relevant to the specific type of service.


### Existing Collections:
${collectionsContext}

Given this context, identify all appropriate collections for the product titled "${title}". Respond with this JSON structure:


Respond with this JSON structure:

{
  "collections": [
    {
      id: "gid://shopify/Collection/1111",
    },
  ],
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-2024-05-13",
      messages: [
        {
          role: "system",
          content,
        },
      ],
      max_tokens: 4096,
      response_format: {
        type: "json_object",
      },
    });

    const collections = JSON.parse(
      response.choices[0].message.content as any
    ).collections;

    const newResponse: CollectionsQuery["collections"]["nodes"] =
      collections.map(({ id }: { id: string }) => {
        return data?.collections.nodes.find((c) => c.id === id);
      });
    return newResponse;
  } catch (error) {
    console.error("Error:", error);
  }
};

const COLLECTION_FRAGMENT = `#graphql
  fragment CollectionFragment on Collection {
    id
    title
    description
    ruleSet {
      rules {
        column
        condition
      }
    }
  }
` as const;

export const COLLECTIONS = `#graphql
  ${COLLECTION_FRAGMENT}
  query collections {
    collections(first: 250, query: "-Alle AND -Subcategory AND -User") {
      nodes {
        ...CollectionFragment
      }
    }
  }
` as const;

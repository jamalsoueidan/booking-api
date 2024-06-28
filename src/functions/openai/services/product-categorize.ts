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

    const collections = data?.collections.nodes;

    // Prepare collections data as context
    const collectionsContext = JSON.stringify(collections, null, 2);

    const content = `
Given the following product title and description, response with the collection titles that this product fits into. The JSON structure should be:

{
  "collections": [
    {
      id: "gid://shopify/Collection/1111",
      title: "example",
      ruleSet: {
        rules: [{
          column
          condition
        }],
      },
    },
  ],
}

Where:
- "collections" includes the existing collections that the product fits into based on the given list of collections.

### Existing Collections:
${collectionsContext}

### Product Details:
Product Title: ${title}
Product Description: ${description}

If you think the product fits multiply collections, it's fine, include them all in the response.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-2024-05-13",
      messages: [
        {
          role: "system",
          content,
        },
      ],
      max_tokens: 300,
      response_format: {
        type: "json_object",
      },
    });

    return JSON.parse(response.choices[0].message.content as any)
      .collections as CollectionsQuery["collections"]["nodes"];
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
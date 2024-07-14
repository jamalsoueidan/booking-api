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
Product Description: ${description}

### Existing Collections:
${collectionsContext}

Subcollections (e.g., Helfarvning, Striber, Børneklip, etc.) are part of main collections (e.g., Makeup, Hårklip, Hårfarvning, etc.). Each main collection has relations to subcollections through rules specified in their conditions.

For example, if a main collection has the following rule:
{
  "column": "TAG",
  "condition": "collectionid-628615086407"
}
Then the main collection includes "Helfarvning" as a subcollection.

Given this context, identify the subcollections that best fit the product title and description. Consider the type of service or product described and find all relevant subcollections. Avoid including subcollections that are not contextually relevant to the specific type of service.

Additionally, for each identified subcollection, return all main collections it belongs to.

Respond with this JSON structure:

{
  "collections": [
    {
      "id": "gid://shopify/Collection/1111",
      "title": "...",
      "mainCollections": [
        {
          "id": "gid://shopify/Collection/2222",
          "title": "..."
        },
        // Additional main collections...
      ]
    },
    // Additional subcollections...
  ]
}
`;

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

    const collections: Array<
      CollectionsQuery["collections"]["nodes"][0] & {
        mainCollections: Array<CollectionsQuery["collections"]["nodes"][0]>;
      }
    > = JSON.parse(response.choices[0].message.content as any).collections;

    const newResponse: CollectionsQuery["collections"]["nodes"] =
      collections.reduce((prev, current) => {
        prev.push(current);
        current.mainCollections.forEach((mc) => {
          prev.push(mc);
        });
        return prev;
      }, [] as Array<CollectionsQuery["collections"]["nodes"][0]>);

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

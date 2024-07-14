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
    const subCollections = data?.collections.nodes.filter(
      (p) => p.ruleSet?.rules && p.ruleSet.rules?.length === 1
    );

    const collectionsContext = JSON.stringify(subCollections, null, 2);

    const content = `
### Product Details:
Product Title: ${title}
Product Description: ${description}

### Existing Collections:
${collectionsContext}

Identify all collections that best fit the product title from the given collections. Consider the type of service or product described in the title and find all relevant collections. Avoid including collections that are not contextually relevant to the specific type of service.

### Existing Collections:
${collectionsContext}

Given this context, identify all appropriate collections for the product titled "${title}". Respond with this JSON structure, just id and title:


Respond with this JSON structure:

{
  "collections": [
    {
      "id": "gid://shopify/Collection/1111",
      "title": "...",
    },
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

    const chatgptSubCollections: Array<
      CollectionsQuery["collections"]["nodes"][0]
    > = JSON.parse(response.choices[0].message.content as any).collections;

    const rootCollections = data?.collections.nodes.filter(
      (p) => p.ruleSet?.rules && p.ruleSet.rules?.length > 1
    );

    const newResponse: Array<{ id: string; title: string }> =
      chatgptSubCollections.reduce((prev, current) => {
        //find and add main collection
        rootCollections?.forEach((collection) => {
          if (collection.ruleSet?.rules?.length) {
            const rule = collection.ruleSet?.rules.find((r) =>
              r.condition.includes(current.id.split("/").pop() as any)
            );
            if (rule) {
              prev.push({ id: collection.id, title: collection.title });
            }
          }
        });
        //add sub collection
        prev.push(current);

        return prev;
      }, [] as Array<{ id: string; title: string }>);

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

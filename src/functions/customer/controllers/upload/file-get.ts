import { shopifyAdmin } from "~/library/shopify";

export async function fileGetHandler(metaobjectId: string) {
  const { data } = await shopifyAdmin.request(FILE_GET, {
    variables: {
      query: metaobjectId,
    },
  });

  return data;
}

const FILE_GET = `#graphql
  query FileGet($query: String!) {
    files(first: 1, query: $query) {
      nodes {
        preview {
          image {
            url
            width
            height
          }
        }
      }
    }
  }
` as const;

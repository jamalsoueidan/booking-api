import { shopifyAdmin } from "~/library/shopify";

export async function fileGetHandler(metaobjectId: string) {
  const { data } = await shopifyAdmin.request(FILE_GET, {
    variables: {
      id: metaobjectId,
    },
  });

  return data?.node?.preview?.image;
}

const FILE_GET = `#graphql
  query FileGet($id: ID!) {
    node(id: $id) {
      ... on MediaImage {
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

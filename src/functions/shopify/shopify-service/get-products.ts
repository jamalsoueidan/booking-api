import { gql, request } from "graphql-request";

export type ShopifyProduct = {
  id: string;
  title: string;
  featuredImage: {
    url: string;
  };
};

export type ShopifyServiceGetProducts = {
  collection: {
    products: {
      nodes: ShopifyProduct[];
    };
  };
};

const query = gql`
  query ($gidCollectionId: ID!) {
    collection(id: $gidCollectionId) {
      products(first: 50) {
        nodes {
          id
          title
          featuredImage {
            url
          }
        }
      }
    }
  }
`;

const headers = {
  "X-Shopify-Access-Token": process.env["ShopifyAccessToken"] || "",
};

export const ShopifyServiceGetProducts = async (
  gidCollectionId: string
): Promise<ShopifyProduct[]> => {
  const response = await request<
    ShopifyServiceGetProducts,
    { gidCollectionId: string }
  >(
    process.env["ShopifyApiUrl"] || "https://myshopify.com/graphql.json",
    query,
    { gidCollectionId },
    headers
  );
  return response.collection?.products?.nodes;
};

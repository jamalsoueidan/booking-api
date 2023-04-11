import { gql, request } from "graphql-request";

export type ShopifyProduct = {
  id: string;
  title: string;
  featuredImage: any;
};

export type ShopifyServiceGetProducts = {
  collection: {
    products: {
      nodes: Array<ShopifyProduct>;
    };
  };
};

const query = gql`
  query ($collectionId: ID!) {
    collection(id: $collectionId) {
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
  collectionId: string
): Promise<
  ShopifyServiceGetProducts["collection"]["products"]["nodes"] | undefined
> => {
  const response = await request<
    ShopifyServiceGetProducts,
    { collectionId: string }
  >(process.env["ShopifyApiUrl"] || "", query, { collectionId }, headers);
  return response.collection?.products?.nodes;
};

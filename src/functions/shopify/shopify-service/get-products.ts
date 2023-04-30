import { gql, request } from "graphql-request";

export type ShopifyProduct = {
  id: string;
  title: string;
  featuredImage: {
    url: string;
  };
};

export type ShopifyServiceGetProductsResponse = {
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
            width
            height
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
    ShopifyServiceGetProductsResponse,
    { gidCollectionId: string }
  >(process.env["ShopifyApiUrl"] || "", query, { gidCollectionId }, headers);
  return response.collection?.products?.nodes;
};

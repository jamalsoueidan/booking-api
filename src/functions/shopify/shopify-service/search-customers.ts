import { gql, request } from "graphql-request";

export type ShopifyCustomer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type ShopifyServiceSearchCustomersVariables = {
  keyword: string;
  limit?: number;
};

export type ShopifyServiceSearchCustomersResponse = {
  customers: {
    nodes: Array<ShopifyCustomer>;
  };
};

const query = gql`
  query ($keyword: String!, $limit: Int!) {
    customers(first: $limit, query: $keyword) {
      nodes {
        id
        firstName
        lastName
        email
        phone
      }
    }
  }
`;

const headers = {
  "X-Shopify-Access-Token": process.env["ShopifyAccessToken"] || "",
};

export const ShopifyServiceSearchCustomers = async (
  props: ShopifyServiceSearchCustomersVariables
) => {
  const response = await request<
    ShopifyServiceSearchCustomersResponse,
    ShopifyServiceSearchCustomersVariables
  >(process.env["ShopifyApiUrl"] || "", query, { limit: 5, ...props }, headers);
  return response?.customers?.nodes;
};

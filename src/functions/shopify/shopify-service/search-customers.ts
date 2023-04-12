import { gql, request } from "graphql-request";

export type ShopifyCustomer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type ShopifyServiceSearchCustomersResponse = {
  customers: {
    nodes: Array<ShopifyCustomer>;
  };
};

const query = gql`
  query ($name: String!, $limit: Int!) {
    customers(first: $limit, query: $name) {
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
  name: string,
  limit: number = 5
) => {
  const response = await request<
    ShopifyServiceSearchCustomersResponse,
    { name: string; limit: number }
  >(process.env["ShopifyApiUrl"] || "", query, { name, limit }, headers);
  return response.customers.nodes;
};

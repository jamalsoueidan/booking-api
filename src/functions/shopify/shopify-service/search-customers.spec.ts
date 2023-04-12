import request from "graphql-request";
import {
  ShopifyServiceSearchCustomers,
  ShopifyServiceSearchCustomersResponse,
} from "./search-customers";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("graphql-request");

describe("ShopifyServiceSearchCustomers", () => {
  it("search customers from the Shopify API", async () => {
    const mockData: ShopifyServiceSearchCustomersResponse = {
      customers: {
        nodes: [
          {
            id: "gid://shopify/Customer/7032704631111",
            firstName: "sara",
            lastName: "soueidan",
            email: "sara@gmail.com",
            phone: "+4540123214",
          },
        ],
      },
    };

    (request as jest.Mock).mockResolvedValue(mockData);

    const result = await ShopifyServiceSearchCustomers("sara");
    expect(result).toEqual(mockData.customers.nodes);
  });
});

import request from "graphql-request";
import {
  ShopifyServiceSearchCustomers,
  ShopifyServiceSearchCustomersResponse,
} from "./search-customers";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("graphql-request");

describe("ShopifyServiceSearchCustomers", () => {
  it("search customers by name from the Shopify API", async () => {
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

    const result = await ShopifyServiceSearchCustomers({ keyword: "sara" });
    expect(result).toEqual(mockData.customers.nodes);
  });

  it("search customers by id from the Shopify API", async () => {
    const mockData: ShopifyServiceSearchCustomersResponse = {
      customers: {
        nodes: [
          {
            id: "gid://shopify/Customer/6713253200146",
            firstName: "jamal",
            lastName: "test",
            email: "jamal@soueidan.com",
            phone: "+4540123214",
          },
        ],
      },
    };

    (request as jest.Mock).mockResolvedValue(mockData);

    const result = await ShopifyServiceSearchCustomers({
      keyword: "6713253200146",
    });
    expect(result).toEqual(mockData.customers.nodes);
  });
});

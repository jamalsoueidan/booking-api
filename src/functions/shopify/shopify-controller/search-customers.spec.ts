import { HttpRequest, InvocationContext } from "@azure/functions";
import { AuthRole } from "~/functions/auth";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import {
  ShopifyCustomer,
  ShopifyServiceSearchCustomers,
} from "../shopify-service";
import {
  ShopifyControllerSearchCustomers,
  ShopifyControllerSearchCustomersRequest,
  ShopifyControllerSearchCustomersResponse,
} from "./search-customers";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("../shopify-service");

describe("ShopifyControllerSearchCustomers", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  beforeEach(async () => {
    context = createContext();
  });

  it("Should be able to search firstName", async () => {
    const mockData: Array<ShopifyCustomer> = [
      {
        id: "gid://shopify/Customer/7032704631111",
        firstName: "sara",
        lastName: "soueidan",
        email: "sara@gmail.com",
        phone: "+4540123214",
      },
    ];

    (ShopifyServiceSearchCustomers as jest.Mock).mockResolvedValue(mockData);

    request = await createHttpRequest<ShopifyControllerSearchCustomersRequest>({
      query: {
        keyword: "sara",
      },
      loginAs: AuthRole.owner,
    });

    const res: HttpSuccessResponse<ShopifyControllerSearchCustomersResponse> =
      await ShopifyControllerSearchCustomers(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload[0].firstName).toBe("sara");
  });

  it("Should be able to search id", async () => {
    const mockData: Array<ShopifyCustomer> = [
      {
        id: "gid://shopify/Customer/6713253200146",
        firstName: "jamal",
        lastName: "soueidan",
        email: "jamal@gmail.com",
        phone: "+4531317428",
      },
    ];

    (ShopifyServiceSearchCustomers as jest.Mock).mockResolvedValue(mockData);

    request = await createHttpRequest<ShopifyControllerSearchCustomersRequest>({
      query: {
        keyword: "6713253200146",
      },
      loginAs: AuthRole.owner,
    });

    const res: HttpSuccessResponse<ShopifyControllerSearchCustomersResponse> =
      await ShopifyControllerSearchCustomers(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload[0].firstName).toBe("jamal");
  });
});

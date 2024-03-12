import { InvocationContext } from "@azure/functions";
import { createContext } from "~/library/jest/azure";
import { webhookProductProcess } from "./product";
import { productDumbData } from "./product.dumb";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("~/library/application-insight", () => ({
  telemetryClient: {
    trackException: jest.fn(),
  },
}));

describe("webhookOrderProcess", () => {
  let context: InvocationContext = createContext();

  it("Should be able to add body to order and update it", async () => {
    let res = await webhookProductProcess(productDumbData, context);
    console.log(res);
  });
});

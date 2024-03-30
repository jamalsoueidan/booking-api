import { InvocationContext } from "@azure/functions";
import { createContext } from "~/library/jest/azure";
import { orderNofulfillment } from "./data-order";
import { webhookOrderProcess } from "./order";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("~/library/application-insight", () => ({
  telemetryClient: {
    trackException: jest.fn(),
  },
}));

describe("webhookOrderProcess", () => {
  let context: InvocationContext = createContext();

  it("Should be able to add body to order and update it", async () => {
    let res = await webhookOrderProcess(orderNofulfillment, context);

    expect(res).toBeDefined();
    expect(res?.line_items.length).toBe(2);
  });
});

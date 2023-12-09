import { InvocationContext } from "@azure/functions";
import { createContext } from "~/library/jest/azure";
import { orderNofulfillment } from "./data-ordre";
import { orderWithfulfillmentAndRefunds } from "./data-with-fullfilment-and-refunds";
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
    expect(res?.fulfillments.length).toBe(0);
    expect(res?.refunds.length).toBe(0);

    res = await webhookOrderProcess(orderWithfulfillmentAndRefunds, context);

    expect(res).toBeDefined();
    expect(res?.fulfillments.length).toBe(5);
    expect(res?.refunds.length).toBe(1);
  });
});

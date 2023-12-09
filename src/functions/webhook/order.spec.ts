import { InvocationContext } from "@azure/functions";
import { createContext } from "~/library/jest/azure";
import { orderNofulfillment } from "./data-ordre";
import { orderWithfulfillmentAndRefunds } from "./data-ordre-with-fullfilment-and-refunds";
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
    if (!res) throw new Error("res is undefined");

    // TODO: Find a way to test that fulfillment actually gets the latest fulfillment of the unique line_item out from updated_at
    /*const oldFulfillment = orderWithfulfillmentAndRefunds.fulfillments.find(
      (f) => {
        return f.line_items.some(
          (l: OrderLineItem) => l.name === "Børneklip (fra 6 år) - Artist 0"
        );
      }
    );

    const newFulfillment = res.fulfillments.find((f) => {
      return f.line_items.some(
        (l: OrderLineItem) => l.name === "Børneklip (fra 6 år) - Artist 0"
      );
    });
    console.log(oldFulfillment);
    console.log(newFulfillment);*/

    expect(res).toBeDefined();
    expect(res?.fulfillments.length).toBe(2);
    expect(res?.refunds.length).toBe(1);
  });
});

import { HttpRequest, InvocationContext } from "@azure/functions";

import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";

import { getProductObject } from "~/library/jest/helpers/product";
import { CustomerScheduleServiceCreate } from "../../services/schedule/create";
import {
  CustomerProductControllerAdd,
  CustomerProductControllerAddRequest,
  CustomerProductControllerAddResponse,
} from "./add";

require("~/library/jest/mongoose/mongodb.jest");

describe("ScheduleProductControllerAdd", () => {
  let context: InvocationContext;
  let request: HttpRequest;
  const customerId = 123;
  const productId = 1000;

  beforeEach(async () => {
    context = createContext();
  });

  it("should be able to add slots schedule", async () => {
    const newSchedule = await CustomerScheduleServiceCreate({
      name: "asd",
      customerId,
    });

    const body = getProductObject();
    request = await createHttpRequest<CustomerProductControllerAddRequest>({
      query: {
        customerId,
        productId: 1000,
      },
      body: { ...body, scheduleId: newSchedule._id },
    });

    const res: HttpSuccessResponse<CustomerProductControllerAddResponse> =
      await CustomerProductControllerAdd(request, context);

    expect(res.jsonBody?.success).toBeTruthy();

    console.log(res.jsonBody?.payload);
    expect(res.jsonBody?.payload).toEqual(
      expect.objectContaining({
        productId: 1000,
      })
    );
  });
});

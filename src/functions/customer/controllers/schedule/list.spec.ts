import { HttpRequest, InvocationContext } from "@azure/functions";
import { CustomerScheduleServiceCreate } from "~/functions/customer/services";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";

import { TimeUnit } from "~/functions/schedule";
import {
  CustomerScheduleControllerList,
  CustomerScheduleControllerListRequest,
  CustomerScheduleControllerListResponse,
} from "./list";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerScheduleControllerList", () => {
  let context: InvocationContext;
  let request: HttpRequest;
  const customerId = 123;

  beforeEach(async () => {
    context = createContext();
  });

  it("should be able to get all schedules for customer", async () => {
    await CustomerScheduleServiceCreate({
      name: "Test Schedule 2",
      customerId,
    });

    request = await createHttpRequest<CustomerScheduleControllerListRequest>({
      query: {
        customerId,
      },
    });

    const res: HttpSuccessResponse<CustomerScheduleControllerListResponse> =
      await CustomerScheduleControllerList(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload).toHaveLength(1);
  });

  it("should not return any schedules since none have products for customer", async () => {
    await CustomerScheduleServiceCreate({
      name: "Test Schedule 2",
      customerId,
    });

    request = await createHttpRequest<CustomerScheduleControllerListRequest>({
      query: {
        customerId,
        productsExist: true,
      },
    });

    const res: HttpSuccessResponse<CustomerScheduleControllerListResponse> =
      await CustomerScheduleControllerList(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload).toHaveLength(0);
  });

  it("should be able to get all schedules with products for customer", async () => {
    await CustomerScheduleServiceCreate({
      name: "Test Schedule 2",
      customerId,
      products: [
        {
          productId: 1,
          variantId: 1,
          duration: 1,
          breakTime: 1,
          bookingPeriod: {
            unit: TimeUnit.WEEKS,
            value: 1,
          },
          noticePeriod: {
            unit: TimeUnit.DAYS,
            value: 1,
          },
          description: "asd",
          locations: [],
        },
      ],
    });

    request = await createHttpRequest<CustomerScheduleControllerListRequest>({
      query: {
        customerId,
        productsExist: "true",
      },
    });

    const res: HttpSuccessResponse<CustomerScheduleControllerListResponse> =
      await CustomerScheduleControllerList(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload).toHaveLength(1);
  });
});

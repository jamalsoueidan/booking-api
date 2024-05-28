import { HttpRequest, InvocationContext } from "@azure/functions";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import { ensureType } from "~/library/jest/helpers/mock";
import { createSchedule } from "~/library/jest/helpers/schedule";
import { shopifyAdmin } from "~/library/shopify";
import { DestroyScheduleMetafieldMutation } from "~/types/admin.generated";
import {
  CustomerScheduleControllerDestroy,
  CustomerScheduleControllerDestroyRequest,
  CustomerScheduleControllerDestroyResponse,
} from "./destroy";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("~/library/shopify", () => ({
  shopifyAdmin: jest.fn().mockReturnValue({
    request: jest.fn(),
  }),
}));

const mockRequest = shopifyAdmin().request as jest.Mock;

describe("CustomerScheduleControllerDestroy", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  beforeEach(async () => {
    context = createContext();
  });

  it("should be able to destroy schedule", async () => {
    const newSchedule = await createSchedule({
      name: "asd",
      customerId: 123,
    });

    mockRequest.mockResolvedValueOnce({
      data: ensureType<DestroyScheduleMetafieldMutation>({
        metafieldDelete: {
          deletedId: "gid://shopify/Metaobject/77850968391",
        },
      }),
    });

    request = await createHttpRequest<CustomerScheduleControllerDestroyRequest>(
      {
        query: {
          customerId: newSchedule.customerId,
          scheduleId: newSchedule._id,
        },
      }
    );

    const res: HttpSuccessResponse<CustomerScheduleControllerDestroyResponse> =
      await CustomerScheduleControllerDestroy(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload.deletedCount).toBe(1);
  });
});

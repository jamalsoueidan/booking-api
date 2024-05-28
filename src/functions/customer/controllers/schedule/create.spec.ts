import { HttpRequest, InvocationContext } from "@azure/functions";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import { ensureType } from "~/library/jest/helpers/mock";
import { shopifyAdmin } from "~/library/shopify";
import { CreateScheduleMetaobjectMutation } from "~/types/admin.generated";
import {
  CustomerScheduleControllerCreate,
  CustomerScheduleControllerCreateRequest,
  CustomerScheduleControllerCreateResponse,
} from "./create";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("~/library/shopify", () => ({
  shopifyAdmin: jest.fn().mockReturnValue({
    request: jest.fn(),
  }),
}));

const mockRequest = shopifyAdmin().request as jest.Mock;

describe("CustomerScheduleControllerCreate", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  beforeEach(async () => {
    context = createContext();
  });

  it("should be able to create schedule", async () => {
    mockRequest.mockResolvedValueOnce({
      data: ensureType<CreateScheduleMetaobjectMutation>({
        metaobjectCreate: {
          metaobject: {
            id: "gid://shopify/Metaobject/77850968391",
            type: "schedule",
            fields: [
              {
                value: "test",
                key: "name",
              },
              {
                value: JSON.stringify([
                  {
                    day: "monday",
                    intervals: [
                      {
                        to: "16:00",
                        from: "08:00",
                      },
                    ],
                  },
                ]),
                key: "slots",
              },
            ],
          },
        },
      }),
    });

    request = await createHttpRequest<CustomerScheduleControllerCreateRequest>({
      query: {
        customerId: 123,
      },
      body: {
        name: "test",
      },
    });

    const res: HttpSuccessResponse<CustomerScheduleControllerCreateResponse> =
      await CustomerScheduleControllerCreate(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload).toHaveProperty("_id");
  });
});

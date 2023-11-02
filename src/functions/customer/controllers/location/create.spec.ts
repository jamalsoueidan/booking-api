import { HttpRequest, InvocationContext } from "@azure/functions";

import { LocationTypes } from "~/functions/location";
import { LocationServiceValidateAddress } from "~/functions/location/services/validate-address";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import { createUser } from "~/library/jest/helpers";
import { getLocationObject } from "~/library/jest/helpers/location";
import {
  CustomerLocationControllerCreate,
  CustomerLocationControllerCreateRequest,
  CustomerLocationControllerCreateResponse,
} from "./create";

require("~/library/jest/mongoose/mongodb.jest");
jest.mock("~/functions/location/services/validate-address");

const mockedLocationServiceValidateAddress =
  LocationServiceValidateAddress as jest.MockedFunction<
    typeof LocationServiceValidateAddress
  >;

describe("CustomerLocationControllerCreate", () => {
  let context: InvocationContext;
  let request: HttpRequest;
  const customerId = 123;

  beforeEach(async () => {
    context = createContext();

    await createUser({ customerId });

    mockedLocationServiceValidateAddress.mockImplementationOnce(
      async (fullAddress: string, excludeLocationId?: string) => ({
        fullAddress: "Sigridsvej 45, 1. th, 8220 Brabrand",
        latitude: 56.15563438,
        longitude: 10.12961271,
      })
    );
  });

  it("should be able to create location origin", async () => {
    request = await createHttpRequest<CustomerLocationControllerCreateRequest>({
      query: {
        customerId,
      },
      body: getLocationObject({ customerId }),
    });

    const res: HttpSuccessResponse<CustomerLocationControllerCreateResponse> =
      await CustomerLocationControllerCreate(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload.locationType).toEqual(LocationTypes.ORIGIN);
  });

  it("should be able to create location destination", async () => {
    request = await createHttpRequest<CustomerLocationControllerCreateRequest>({
      query: {
        customerId,
      },
      body: getLocationObject({
        customerId,
        locationType: LocationTypes.DESTINATION,
      }),
    });

    const res: HttpSuccessResponse<CustomerLocationControllerCreateResponse> =
      await CustomerLocationControllerCreate(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload.locationType).toEqual(
      LocationTypes.DESTINATION
    );
    expect(res.jsonBody?.payload.distanceForFree).toBeDefined();
  });
});

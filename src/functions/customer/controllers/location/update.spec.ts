import { HttpRequest, InvocationContext } from "@azure/functions";

import { LocationTypes } from "~/functions/location";
import { LocationServiceValidateAddress } from "~/functions/location/services/validate-address";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import { createUser } from "~/library/jest/helpers";
import {
  createLocation,
  getLocationObject,
} from "~/library/jest/helpers/location";
import {
  CustomerLocationControllerUpdate,
  CustomerLocationControllerUpdateRequest,
  CustomerLocationControllerUpdateResponse,
} from "./update";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("~/functions/location/services/validate-address");

const mockedLocationServiceValidateAddress =
  LocationServiceValidateAddress as jest.MockedFunction<
    typeof LocationServiceValidateAddress
  >;

describe("CustomerLocationControllerUpdate", () => {
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

  it("should be able to update location origin", async () => {
    const location = await createLocation({ customerId });
    const {
      customerId: x,
      locationType,
      ...locationBody
    } = getLocationObject({
      customerId,
    });

    request = await createHttpRequest<CustomerLocationControllerUpdateRequest>({
      query: {
        customerId,
        locationId: location._id,
      },
      body: locationBody,
    });

    const res: HttpSuccessResponse<CustomerLocationControllerUpdateResponse> =
      await CustomerLocationControllerUpdate(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload.locationType).toEqual(LocationTypes.ORIGIN);

    expect(res.jsonBody?.payload).toMatchObject({
      ...locationBody,
      fullAddress: "Sigridsvej 45, 1. th, 8220 Brabrand",
    });
  });

  it("should be able to update location destination", async () => {
    const location = await createLocation({
      customerId,
      locationType: LocationTypes.DESTINATION,
    });
    const {
      customerId: x,
      locationType,
      ...locationBody
    } = getLocationObject({
      customerId,
      locationType: LocationTypes.DESTINATION,
    });

    request = await createHttpRequest<CustomerLocationControllerUpdateRequest>({
      query: {
        customerId,
        locationId: location._id,
      },
      body: locationBody,
    });

    const res: HttpSuccessResponse<CustomerLocationControllerUpdateResponse> =
      await CustomerLocationControllerUpdate(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload.locationType).toEqual(
      LocationTypes.DESTINATION
    );
    expect(res.jsonBody?.payload.distanceForFree).toBeDefined();

    expect(res.jsonBody?.payload).toMatchObject({
      ...locationBody,
      fullAddress: "Sigridsvej 45, 1. th, 8220 Brabrand",
    });
  });
});

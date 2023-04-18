import { HttpRequest, InvocationContext } from "@azure/functions";
import { faker } from "@faker-js/faker";
import { AuthRole } from "~/functions/auth";
import { Tag } from "~/functions/shift";
import {
  HttpErrorResponse,
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import {
  DEFAULT_GROUP,
  createUserWithBooking,
  login,
} from "~/library/jest/helpers";
import {
  BookingControllerGetAll,
  BookingControllerGetAllRequest,
  BookingControllerGetAllResponse,
} from "./get-all";

require("~/library/jest/mongoose/mongodb.jest");

const productId = parseInt(faker.random.numeric(10), 10);

describe("BookingControllerGetAll", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  const tag = Tag.all_day;

  beforeEach(async () => {
    context = createContext();
  });

  it("Owner: Should be able to get all bookings", async () => {
    const { booking } = await createUserWithBooking({ group: "a", productId });
    await createUserWithBooking({ group: "a", productId });
    await createUserWithBooking({ group: "b", productId });

    request = await createHttpRequest<BookingControllerGetAllRequest>({
      query: {
        start: booking.start,
        end: booking.end,
      },
      loginAs: AuthRole.owner,
    });

    const res: HttpSuccessResponse<BookingControllerGetAllResponse> =
      await BookingControllerGetAll(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload.length).toBe(3);
  });

  it("Owner: Should throw error when end param is missing", async () => {
    request = await createHttpRequest<BookingControllerGetAllRequest>({
      query: {} as any,
      loginAs: AuthRole.owner,
    });

    const res: HttpErrorResponse = await BookingControllerGetAll(
      request,
      context
    );

    expect(res.jsonBody?.success).toBeFalsy();
    expect(res.jsonBody?.errors).toHaveLength(2);
  });

  it("User and Admin: Should be able to get only bookings in the same group by range", async () => {
    const { token } = await login(AuthRole.user);

    const { booking } = await createUserWithBooking({
      group: DEFAULT_GROUP,
      productId,
    });
    await createUserWithBooking({ group: DEFAULT_GROUP, productId });
    await createUserWithBooking({ group: "b", productId });

    request = await createHttpRequest<BookingControllerGetAllRequest>({
      query: {
        start: booking.start,
        end: booking.end,
      },
      token,
    });

    const res: HttpSuccessResponse<BookingControllerGetAllResponse> =
      await BookingControllerGetAll(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload.length).toBe(2);
  });
});

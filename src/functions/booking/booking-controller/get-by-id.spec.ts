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
import { createUserWithBooking, login } from "~/library/jest/helpers";
import {
  BookingControllerGetById,
  BookingControllerGetByIdRequest,
  BookingControllerGetByIdResponse,
} from "./get-by-id";

require("~/library/jest/mongoose/mongodb.jest");

const productId = parseInt(faker.random.numeric(10), 10);

describe("Shopify: booking get by id route test", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  const tag = Tag.all_day;

  beforeEach(async () => {
    context = createContext();
  });

  it("Owner: Should be able to get any booking by id", async () => {
    const { booking } = await createUserWithBooking({ productId });

    request = await createHttpRequest<BookingControllerGetByIdRequest>({
      query: {
        _id: booking.id,
      },
      loginAs: AuthRole.owner,
    });

    const res: HttpSuccessResponse<BookingControllerGetByIdResponse> =
      await BookingControllerGetById(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload?._id).toStrictEqual(booking._id);
  });

  it("User: Should not be able to get booking by id in another group", async () => {
    const { token } = await login(AuthRole.user);

    const { booking } = await createUserWithBooking({ group: "b", productId });

    request = await createHttpRequest<BookingControllerGetByIdRequest>({
      query: {
        _id: booking.id,
      },
      token,
    });

    const res: HttpErrorResponse = await BookingControllerGetById(
      request,
      context
    );

    expect(res.jsonBody?.success).toBeFalsy();
  });

  it("Admin: Should not be able to get booking by id in another group", async () => {
    const { token } = await login(AuthRole.admin);

    const { booking } = await createUserWithBooking({ group: "b", productId });

    request = await createHttpRequest<BookingControllerGetByIdRequest>({
      query: {
        _id: booking.id,
      },
      token,
    });

    const res: HttpErrorResponse = await BookingControllerGetById(
      request,
      context
    );

    expect(res.jsonBody?.success).toBeFalsy();
  });

  it("User: Should be able to get booking by id in the same group", async () => {
    const { token } = await login(AuthRole.user);

    const { booking } = await createUserWithBooking({ productId });

    request = await createHttpRequest<BookingControllerGetByIdRequest>({
      query: {
        _id: booking.id,
      },
      token,
    });

    const res: HttpSuccessResponse<BookingControllerGetByIdResponse> =
      await BookingControllerGetById(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload?._id).toStrictEqual(booking._id);
  });

  it("Admin: Should be able to get booking by id in the same group", async () => {
    const { token } = await login(AuthRole.admin);

    const { booking } = await createUserWithBooking({ productId });

    request = await createHttpRequest<BookingControllerGetByIdRequest>({
      query: {
        _id: booking.id,
      },
      token,
    });

    const res: HttpSuccessResponse<BookingControllerGetByIdResponse> =
      await BookingControllerGetById(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload?._id).toStrictEqual(booking._id);
  });
});

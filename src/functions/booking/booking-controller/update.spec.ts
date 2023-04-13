import { HttpRequest, InvocationContext } from "@azure/functions";
import { faker } from "@faker-js/faker";
import { addHours } from "date-fns";
import { AuthRole } from "~/functions/auth";
import {
  HttpErrorResponse,
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import {
  createBooking,
  createProduct,
  createUser,
  login,
} from "~/library/jest/helpers";
import {
  BookingControllerUpdate,
  BookingControllerUpdateRequest,
  BookingControllerUpdateResponse,
} from "./update";

require("~/library/jest/mongoose/mongodb.jest");

const productId = parseInt(faker.random.numeric(10), 10);

describe("BookingControllerCreate", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  beforeEach(() => {
    context = createContext();
  });

  it("Owner: Should be able to update booking", async () => {
    const randomUser = await createUser();

    const product = await createProduct({ productId });
    const booking = await createBooking({
      end: addHours(new Date(), 1),
      productId: product.productId,
      userId: randomUser.id,
      start: new Date(),
    });

    request = await createHttpRequest<BookingControllerUpdateRequest>({
      query: {
        _id: booking._id.toString(),
      },
      body: {
        end: addHours(new Date(), 1),
        start: new Date(),
      },
      loginAs: AuthRole.owner,
    });

    const res: HttpSuccessResponse<BookingControllerUpdateResponse> =
      await BookingControllerUpdate(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload._id).toBeDefined();
  });

  it("Owner: Should throw error when fields missing when creating booking", async () => {
    const randomUser = await createUser();

    const product = await createProduct({ productId });
    const booking = await createBooking({
      end: addHours(new Date(), 1),
      productId: product.productId,
      userId: randomUser.id,
      start: new Date(),
    });

    request = await createHttpRequest<BookingControllerUpdateRequest>({
      query: {
        _id: booking._id.toString(),
      },
      body: {} as any,
      loginAs: AuthRole.owner,
    });

    const res: HttpErrorResponse = await BookingControllerUpdate(
      request,
      context
    );

    expect(res.jsonBody?.success).toBeFalsy();
    expect(res.jsonBody?.error.length).toBeGreaterThanOrEqual(1);
  });

  it("User: Should not be able to update booking for another user", async () => {
    const { token } = await login(AuthRole.user);

    const randomUser = await createUser();

    const product = await createProduct({ productId });
    const booking = await createBooking({
      end: addHours(new Date(), 1),
      productId: product.productId,
      userId: randomUser.id,
      start: new Date(),
    });

    request = await createHttpRequest<BookingControllerUpdateRequest>({
      query: {
        _id: booking._id.toString(),
      },
      body: {
        end: addHours(new Date(), 1),
        start: new Date(),
      },
      token,
    });

    const res: HttpErrorResponse = await BookingControllerUpdate(
      request,
      context
    );

    expect(res.jsonBody?.success).toBeFalsy();
    expect(res.jsonBody?.error.length).toBeGreaterThanOrEqual(1);
  });

  it("User: Should be able to update own booking", async () => {
    const { token, user } = await login(AuthRole.user);

    const product = await createProduct({ productId });
    const booking = await createBooking({
      end: addHours(new Date(), 1),
      productId: product.productId,
      userId: user?._id,
      start: new Date(),
    });

    request = await createHttpRequest<BookingControllerUpdateRequest>({
      query: {
        _id: booking._id.toString(),
      },
      body: {
        end: addHours(new Date(), 1),
        start: new Date(),
      },
      token,
    });

    const res: HttpSuccessResponse<BookingControllerUpdateResponse> =
      await BookingControllerUpdate(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload._id).toBeDefined();
  });

  it("Admin: Should not be able to update booking for user in another gorup", async () => {
    const { token } = await login(AuthRole.admin);

    const randomUser = await createUser({
      group: "b",
    });

    const product = await createProduct({ productId });
    const booking = await createBooking({
      end: addHours(new Date(), 1),
      productId: product.productId,
      userId: randomUser.id,
      start: new Date(),
    });

    request = await createHttpRequest<BookingControllerUpdateRequest>({
      query: {
        _id: booking._id.toString(),
      },
      body: {
        end: addHours(new Date(), 1),
        start: new Date(),
      },
      token,
    });

    const res: HttpErrorResponse = await BookingControllerUpdate(
      request,
      context
    );

    expect(res.jsonBody?.success).toBeFalsy();
    expect(res.jsonBody?.error.length).toBeGreaterThanOrEqual(1);
  });
  it("Admin: Should be able to update booking for user in the same group", async () => {
    const { token } = await login(AuthRole.admin);

    const randomUser = await createUser();

    const product = await createProduct({ productId });
    const booking = await createBooking({
      end: addHours(new Date(), 1),
      productId: product.productId,
      userId: randomUser.id,
      start: new Date(),
    });

    request = await createHttpRequest<BookingControllerUpdateRequest>({
      query: {
        _id: booking._id.toString(),
      },
      body: {
        userId: randomUser._id.toString(),
        end: addHours(new Date(), 1),
        start: new Date(),
      },
      token,
    });

    const res: HttpSuccessResponse<BookingControllerUpdateResponse> =
      await BookingControllerUpdate(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload._id).toBeDefined();
  });
});

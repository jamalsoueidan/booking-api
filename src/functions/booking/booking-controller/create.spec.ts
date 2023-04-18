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
  createCustomer,
  createProduct,
  createUser,
  login,
} from "~/library/jest/helpers";
import {
  BookingControllerCreate,
  BookingControllerCreateRequest,
  BookingControllerCreateResponse,
} from "./create";

require("~/library/jest/mongoose/mongodb.jest");

const productId = parseInt(faker.random.numeric(10), 10);

describe("BookingControllerCreate", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  beforeEach(async () => {
    context = createContext();
  });
  it("Owner: Should be able to create booking", async () => {
    const randomUser = await createUser({
      group: "a",
    });

    const customer = await createCustomer();

    await createProduct({ productId });

    request = await createHttpRequest<BookingControllerCreateRequest>({
      body: {
        customerId: customer.customerId,
        end: addHours(new Date(), 1),
        productId,
        userId: randomUser._id.toString(),
        start: new Date(),
      },
      loginAs: AuthRole.owner,
    });

    const res: HttpSuccessResponse<BookingControllerCreateResponse> =
      await BookingControllerCreate(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload._id).toBeDefined();
  });

  it("Owner: Should throw error when fields missing when creating booking", async () => {
    request = await createHttpRequest<BookingControllerCreateRequest>({
      body: {} as any,
      loginAs: AuthRole.owner,
    });

    const res: HttpErrorResponse = await BookingControllerCreate(
      request,
      context
    );

    expect(res.jsonBody?.success).toBeFalsy();
    expect(res.jsonBody?.errors).toHaveLength(5);
  });

  it("User: Should not be able to create booking for another user", async () => {
    const { token } = await login(AuthRole.user);

    const newUser = await createUser();

    request = await createHttpRequest<BookingControllerCreateRequest>({
      body: {
        customerId: 12334432,
        end: addHours(new Date(), 1),
        productId,
        userId: newUser._id.toString(),
        start: new Date(),
      },
      token,
    });

    const res: HttpErrorResponse = await BookingControllerCreate(
      request,
      context
    );

    expect(res.jsonBody?.success).toBeFalsy();
    expect(res.jsonBody?.errors).toBeDefined();
  });

  it("User: Should be able to create booking", async () => {
    const { token, user } = await login(AuthRole.user);

    const customer = await createCustomer();
    await createProduct({ productId });

    request = await createHttpRequest<BookingControllerCreateRequest>({
      body: {
        customerId: customer.customerId,
        end: addHours(new Date(), 1),
        productId,
        userId: user?._id.toString(),
        start: new Date(),
      },
      token,
    });

    const res: HttpSuccessResponse<BookingControllerCreateResponse> =
      await BookingControllerCreate(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload._id).toBeDefined();
  });

  it("Admin: Should not be able to create booking for user in another gorup", async () => {
    const { token } = await login(AuthRole.admin);
    const newUser = await createUser({ group: "b" });
    const customer = await createCustomer();

    await createProduct({ productId });
    request = await createHttpRequest<BookingControllerCreateRequest>({
      body: {
        customerId: customer.customerId,
        end: addHours(new Date(), 1),
        productId,
        userId: newUser._id.toString(),
        start: new Date(),
      },
      token,
    });

    const res: HttpErrorResponse = await BookingControllerCreate(
      request,
      context
    );

    expect(res.jsonBody?.success).toBeFalsy();
    expect(res.jsonBody?.errors).toBeDefined();
  });

  it("Admin: Should be able to create booking for all users in the same group", async () => {
    const { token } = await login(AuthRole.admin);
    const newUser = await createUser();
    const customer = await createCustomer();

    await createProduct({ productId });
    request = await createHttpRequest<BookingControllerCreateRequest>({
      body: {
        customerId: customer.customerId,
        end: addHours(new Date(), 1),
        productId,
        userId: newUser._id.toString(),
        start: new Date(),
      },
      token,
    });

    const res: HttpSuccessResponse<BookingControllerCreateResponse> =
      await BookingControllerCreate(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload._id).toBeDefined();
  });
});

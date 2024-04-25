import { HttpRequest, InvocationContext } from "@azure/functions";

import { TimeUnit } from "~/functions/schedule";

import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";

import { CustomerProductServiceAdd } from "~/functions/customer/services/product/add";
import { CustomerScheduleServiceCreate } from "~/functions/customer/services/schedule/create";
import { createUser } from "~/library/jest/helpers";
import { getProductObject } from "~/library/jest/helpers/product";
import {
  UserProductsControllerListBySchedule,
  UserProductsControllerListByScheduleRequest,
  UserProductsControllerListByScheduleResponse,
} from "./list-by-schedule";

require("~/library/jest/mongoose/mongodb.jest");

const newProduct = getProductObject({
  variantId: 1,
  duration: 60,
  breakTime: 0,
  noticePeriod: {
    value: 1,
    unit: TimeUnit.DAYS,
  },
  bookingPeriod: {
    value: 1,
    unit: TimeUnit.WEEKS,
  },
});

describe("UserProductsControllerListBySchedule", () => {
  let context: InvocationContext = createContext();
  let request: HttpRequest;

  it("Should be able to get all products for user-name (in all schedules, location doesn't count)", async () => {
    const user = await createUser(
      { customerId: 1234321 },
      { username: "jamalsoueidan", isBusiness: true, active: true }
    );

    const newSchedule = await CustomerScheduleServiceCreate({
      name: "vagtplan",
      customerId: user.customerId,
    });

    await CustomerProductServiceAdd(
      {
        customerId: newSchedule.customerId,
      },
      { ...newProduct, productId: 1000, scheduleId: newSchedule._id }
    );

    const newSchedule2 = await CustomerScheduleServiceCreate({
      name: "vagtplan2",
      customerId: user.customerId,
    });

    await CustomerProductServiceAdd(
      {
        customerId: newSchedule2.customerId,
      },
      { ...newProduct, productId: 1002, scheduleId: newSchedule2._id }
    );

    await CustomerProductServiceAdd(
      {
        customerId: newSchedule2.customerId,
      },
      { ...newProduct, productId: 1004, scheduleId: newSchedule2._id }
    );

    request =
      await createHttpRequest<UserProductsControllerListByScheduleRequest>({
        query: { username: user.username! },
      });

    const res: HttpSuccessResponse<UserProductsControllerListByScheduleResponse> =
      await UserProductsControllerListBySchedule(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload).toHaveLength(3);
  });

  it("Should be able to get all products for user-name for specific schedule (location doesn't count)", async () => {
    const user = await createUser(
      { customerId: 1234321 },
      { username: "jamalsoueidan", isBusiness: true, active: true }
    );

    const newSchedule = await CustomerScheduleServiceCreate({
      name: "vagtplan",
      customerId: user.customerId,
    });

    await CustomerProductServiceAdd(
      {
        customerId: newSchedule.customerId,
      },
      { ...newProduct, productId: 1000, scheduleId: newSchedule._id }
    );

    const newSchedule2 = await CustomerScheduleServiceCreate({
      name: "vagtplan2",
      customerId: user.customerId,
    });

    await CustomerProductServiceAdd(
      {
        customerId: newSchedule2.customerId,
      },
      { ...newProduct, productId: 1002, scheduleId: newSchedule2._id }
    );

    await CustomerProductServiceAdd(
      {
        customerId: newSchedule2.customerId,
      },
      { ...newProduct, productId: 1004, scheduleId: newSchedule2._id }
    );

    request =
      await createHttpRequest<UserProductsControllerListByScheduleRequest>({
        query: { username: user.username!, scheduleId: newSchedule2._id },
      });

    const res: HttpSuccessResponse<UserProductsControllerListByScheduleResponse> =
      await UserProductsControllerListBySchedule(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload).toHaveLength(2);
  });
});

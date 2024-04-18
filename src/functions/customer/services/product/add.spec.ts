import { faker } from "@faker-js/faker";
import { NotFoundError } from "~/library/handler";
import { getProductObject } from "~/library/jest/helpers/product";
import { CustomerScheduleServiceCreate } from "../schedule/create";
import { CustomerProductServiceAdd } from "./add";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerProductServiceAdd", () => {
  it("should add a new product to the schedule", async () => {
    const customerId = 123;
    const name = "Test Schedule";
    const productId = 1000;

    const newSchedule = await CustomerScheduleServiceCreate({
      name,
      customerId,
    });

    const productBody = {
      ...getProductObject({
        productHandle: faker.internet.url(),
        variantId: faker.number.int({ min: 1, max: 10000000 }),
        price: {
          amount: "0",
          currencyCode: "DKK",
        },
        selectedOptions: {
          name: "test",
          value: "ok",
        },
        locations: [],
      }),
      scheduleId: newSchedule._id,
    };

    const updateProduct = await CustomerProductServiceAdd(
      {
        customerId: newSchedule.customerId,
        productId,
      },
      productBody
    );

    expect(updateProduct).toMatchObject({
      ...productBody,
      productId,
      scheduleId: newSchedule._id.toString(),
    });
  });

  it("not allow same product in any schedule belonging to same customer", async () => {
    const customerId = 123;
    const name = "Test Schedule";
    const productId = 1000;

    const newSchedule = await CustomerScheduleServiceCreate({
      name,
      customerId,
    });

    const productBody = {
      ...getProductObject({
        productHandle: faker.internet.url(),
        variantId: faker.number.int({ min: 1, max: 10000000 }),
        price: {
          amount: "0",
          currencyCode: "DKK",
        },
        selectedOptions: {
          name: "test",
          value: "ok",
        },
        locations: [],
      }),
      scheduleId: newSchedule._id,
    };

    let updateProduct = await CustomerProductServiceAdd(
      {
        customerId: newSchedule.customerId,
        productId,
      },
      productBody
    );

    expect(updateProduct).toBeDefined();

    await expect(
      CustomerProductServiceAdd(
        {
          customerId: newSchedule.customerId,
          productId,
        },
        { ...productBody, variantId: 12 }
      )
    ).rejects.toThrow(NotFoundError);
  });
});

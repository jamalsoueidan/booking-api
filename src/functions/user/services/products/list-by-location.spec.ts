import { faker } from "@faker-js/faker";
import { CustomerScheduleServiceCreate } from "~/functions/customer/services/schedule/create";
import { LocationTypes } from "~/functions/location";
import { createUser } from "~/library/jest/helpers";
import { createLocation } from "~/library/jest/helpers/location";
import { getProductObject } from "~/library/jest/helpers/product";
import { UserProductsServiceListProductsByLocation } from "./list-by-location";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserProductsServiceListProductsByLocation", () => {
  const customerId = 123;
  const username = "test";

  beforeEach(() => createUser({ customerId }, { username }));

  it("should retrieve a schedule -> products, that only belong to a specific locationId", async () => {
    const locationOrigin = await createLocation({ customerId });
    const locationDestination = await createLocation({
      customerId,
      locationType: LocationTypes.DESTINATION,
    });

    const product1 = getProductObject({
      locations: [
        {
          location: locationOrigin._id,
          locationType: locationOrigin.locationType,
        },
        {
          location: locationDestination._id,
          locationType: locationDestination.locationType,
        },
      ],
    });

    const schedule = await CustomerScheduleServiceCreate({
      name: faker.person.firstName(),
      customerId,
      products: [
        product1,
        getProductObject({
          locations: [
            {
              location: locationOrigin._id,
              locationType: locationOrigin.locationType,
            },
          ],
        }),
      ],
    });

    let getSchedule = await UserProductsServiceListProductsByLocation({
      username,
      productId: product1.productId,
      locationId: locationOrigin._id,
    });

    expect(getSchedule.length).toBe(2);

    getSchedule = await UserProductsServiceListProductsByLocation({
      username,
      productId: product1.productId,
      locationId: locationDestination._id,
    });

    expect(getSchedule.length).toBe(1);
  });

  it("should retrieve a schedule -> with only products that contains inside productId, that only belong to a specific locationId", async () => {
    const locationOrigin = await createLocation({ customerId });
    const locationDestination = await createLocation({
      customerId,
      locationType: LocationTypes.DESTINATION,
    });

    const product1 = getProductObject({
      locations: [
        {
          location: locationOrigin._id,
          locationType: locationOrigin.locationType,
        },
        {
          location: locationDestination._id,
          locationType: locationDestination.locationType,
        },
      ],
    });

    const product2 = getProductObject({
      locations: [
        {
          location: locationOrigin._id,
          locationType: locationOrigin.locationType,
        },
        {
          location: locationDestination._id,
          locationType: locationDestination.locationType,
        },
      ],
    });

    const product3 = getProductObject({
      locations: [
        {
          location: locationOrigin._id,
          locationType: locationOrigin.locationType,
        },
        {
          location: locationDestination._id,
          locationType: locationDestination.locationType,
        },
      ],
    });

    const schedule = await CustomerScheduleServiceCreate({
      name: faker.person.firstName(),
      customerId,
      products: [product1, product2, product3],
    });

    let getSchedule = await UserProductsServiceListProductsByLocation({
      username,
      productId: [product1.productId, product2.productId],
      locationId: locationOrigin._id,
    });

    const containsProduct1 = getSchedule.some(
      (product) => product.productId === product1.productId
    );
    const containsProduct2 = getSchedule.some(
      (product) => product.productId === product2.productId
    );
    expect(getSchedule.length).toBe(2);
    expect(containsProduct1).toBe(true);
    expect(containsProduct2).toBe(true);

    getSchedule = await UserProductsServiceListProductsByLocation({
      username,
      productId: [product2.productId, product3.productId],
      locationId: locationDestination._id,
    });

    const containsProduct3 = getSchedule.some(
      (product) => product.productId === product2.productId
    );
    const containsProduct4 = getSchedule.some(
      (product) => product.productId === product3.productId
    );

    expect(getSchedule.length).toBe(2);
    expect(containsProduct3).toBe(true);
    expect(containsProduct4).toBe(true);
  });

  it("should throw error for when not found", async () => {
    await expect(
      UserProductsServiceListProductsByLocation({
        username: "test",
        productId: 123,
        locationId: "ads" as any,
      })
    ).rejects.toThrowError();
  });
});

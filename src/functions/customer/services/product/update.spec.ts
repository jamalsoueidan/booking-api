import { TimeUnit } from "~/functions/schedule";
import { createUser } from "~/library/jest/helpers";
import {
  createLocation,
  getDumbLocationObject,
} from "~/library/jest/helpers/location";
import { getProductObject } from "~/library/jest/helpers/product";
import { createScheduleWithProducts } from "~/library/jest/helpers/schedule";
import { CustomerProductServiceGet } from "./get";
import { CustomerProductServiceUpdate } from "./update";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerProductServiceUpdate", () => {
  const customerId = 123;
  const name = "Test Schedule";

  it("should update an existing product in the schedule", async () => {
    const user = await createUser({ customerId });
    const location = await createLocation({ customerId: user.customerId });

    const newSchedule = await createScheduleWithProducts({
      name,
      customerId,
      metafieldId: "gid://shopify/Metafield/533232",
      products: [
        getProductObject({
          locations: [
            getDumbLocationObject({ ...location, location: location._id }),
          ],
          parentId: 1,
          description: "test test",
          descriptionHtml: "<p>test test</p>",
          hideFromProfile: false,
          hideFromCombine: false,
          productId: 2,
          variantId: 3,
          duration: 120,
          breakTime: 0,
          noticePeriod: {
            value: 1,
            unit: TimeUnit.DAYS,
          },
          bookingPeriod: {
            value: 1,
            unit: TimeUnit.WEEKS,
          },
        }),
      ],
    });

    const productBody = {
      duration: 90,
      price: {
        amount: "99.00",
      },
      compareAtPrice: {
        amount: "199.0",
      },
    };

    let updateProduct = await CustomerProductServiceUpdate(
      {
        customerId: newSchedule.customerId,
        productId: 2,
      },
      productBody
    );

    const getUpdatedProduct = await CustomerProductServiceGet({
      customerId: newSchedule.customerId,
      productId: 2,
    });

    expect(getUpdatedProduct.productId).toEqual(updateProduct.productId);
  });
});

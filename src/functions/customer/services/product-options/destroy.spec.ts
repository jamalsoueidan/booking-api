import { ScheduleModel } from "~/functions/schedule";
import { getProductObject } from "~/library/jest/helpers/product";
import { createScheduleWithProducts } from "~/library/jest/helpers/schedule";
import { CustomerProductOptionsServiceDestroy } from "./destroy";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerProductOptionsDestroyService", () => {
  it("should be able to destroy product option", async () => {
    const productId = 321;
    const optionProductId = 123;
    const customerId = 123123;
    const mockProduct = {
      id: "123",
    };

    const product = {
      ...getProductObject({
        productId: productId,
        options: [
          {
            productId: optionProductId,
            title: "asd",
            variants: [],
            required: true,
          },
        ],
      }),
    };

    const newSchedule = await createScheduleWithProducts({
      name: "Test Schedule",
      customerId,
      products: [product],
    });

    const result = await CustomerProductOptionsServiceDestroy({
      customerId,
      productId,
      optionProductId,
    });

    expect(result).toHaveLength(0);

    let schedule = await ScheduleModel.findOne(newSchedule._id).orFail();
    expect(schedule.products).toHaveLength(1);
    let scheduleProduct = schedule.products[0];
    expect(scheduleProduct.options).toHaveLength(0);
  });
});

import { Schedule, ScheduleModel, ScheduleProduct } from "~/functions/schedule";
import { CustomerServiceGet } from "../customer/get";
import { CustomerProductServiceGet } from "./get";

export type CustomerProductServiceUpdate = {
  customerId: Schedule["customerId"];
  productId: ScheduleProduct["productId"];
};

export type CustomerProductServiceUpdateBody = Partial<
  Omit<ScheduleProduct, "productId">
>;

export const CustomerProductServiceUpdate = async (
  { customerId, productId }: CustomerProductServiceUpdate,
  body: CustomerProductServiceUpdateBody
) => {
  const user = await CustomerServiceGet({
    customerId,
  });

  const { scheduleId, scheduleMetafieldId, scheduleName, ...oldProduct } =
    await CustomerProductServiceGet({
      customerId,
      productId,
    });

  const locations = oldProduct.locations.concat(
    (body.locations || [])?.filter(
      (item2) =>
        !oldProduct.locations.some(
          (item1) => item1.location.toString() === item2.location.toString() // must use toString since location could be type of objectId
        )
    )
  );

  const newProduct = {
    ...oldProduct,
    ...body,
    active: user.active,
    noticePeriod: {
      ...oldProduct.noticePeriod,
      ...body.noticePeriod,
    },
    bookingPeriod: {
      ...oldProduct.bookingPeriod,
      ...body.bookingPeriod,
    },
    compareAtPrice: {
      ...oldProduct.compareAtPrice,
      ...body.compareAtPrice,
    },
    price: {
      ...oldProduct.price,
      ...body.price,
    },
    locations,
    options: mergeArraysUnique(
      oldProduct?.options || [],
      body?.options || [],
      "productId"
    ),
  };

  await ScheduleModel.updateOne(
    {
      customerId,
      "products.productId": productId,
    },
    {
      $set: {
        "products.$": newProduct,
      },
    }
  );

  return {
    ...newProduct,
    scheduleId: scheduleId.toString(),
    scheduleName,
  };
};

export function mergeArraysUnique<T>(
  arr1: Array<T>,
  arr2: Array<T>,
  uniqueKey: keyof T
) {
  const merged = new Map();
  arr1.forEach((item) => merged.set(item[uniqueKey], item));
  arr2.forEach((item) => {
    if (!merged.has(item[uniqueKey])) {
      merged.set(item[uniqueKey], item);
    } else {
      merged.set(item[uniqueKey], {
        ...merged.get(item[uniqueKey]),
        ...item,
      });
    }
  });

  return Array.from(merged.values()) as T[];
}

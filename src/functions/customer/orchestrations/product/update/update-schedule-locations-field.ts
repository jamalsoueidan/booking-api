import { LocationModel } from "~/functions/location";
import { ScheduleModel } from "~/functions/schedule";
import { NotFoundError } from "~/library/handler";
import { shopifyAdmin } from "~/library/shopify";

export const updateScheduleLocationsFieldName = "updateScheduleLocationsField";
export const updateScheduleLocationsField = async ({
  productId,
  customerId,
}: {
  productId: number;
  customerId: number;
}) => {
  const schedule = await ScheduleModel.findOne({
    customerId,
    products: {
      $elemMatch: {
        productId,
      },
    },
  });

  if (!schedule?.metafieldId) {
    throw new Error(
      `Failed to update schedule locations field for productId ${productId}`
    );
  }

  // save unique locations for this schedule metafield that are found in the current schedule model.
  const locationIds = schedule.products.flatMap((product) =>
    product.locations.map((location) => location.location.toString())
  );

  const locations = await LocationModel.find({
    _id: { $in: locationIds },
  }).orFail(
    new NotFoundError([
      {
        path: ["customerId", "locations"],
        message: "LOCATIONS_ERROR",
        code: "custom",
      },
    ])
  );

  const { data } = await shopifyAdmin().request(
    UPDATE_SCHEDULE_LOCATIONS_FIELD,
    {
      variables: {
        id: schedule.metafieldId,
        fields: [
          {
            key: "locations",
            value: JSON.stringify(
              locations.map((location) => location.metafieldId)
            ),
          },
        ],
      },
    }
  );

  if (!data?.metaobjectUpdate?.metaobject) {
    throw new Error(
      `Failed to update schedule locations field for schedule ${schedule._id}`
    );
  }

  return data?.metaobjectUpdate.metaobject;
};

export const UPDATE_SCHEDULE_LOCATIONS_FIELD = `#graphql
  mutation UpdateScheduleLocationsField($id: ID!, $fields: [MetaobjectFieldInput!]!) {
    metaobjectUpdate(id: $id, metaobject: {fields: $fields}) {
      metaobject {
        fields {
          value
          key
        }
      }
    }
  }
` as const;

import { LocationModel, LocationTypes } from "~/functions/location";
import { ScheduleModel } from "~/functions/schedule";
import { UserModel } from "../../user.model";

type UserAggregationResult = {
  locations: Array<{
    city: string;
    locationType: LocationTypes;
    count: number;
  }>;
  availableDays: Array<{
    day: string;
    count: number;
  }>;
  products: Array<{
    productHandle: string;
    productId: string;
    count: number;
  }>;
  specialties: Array<{
    speciality: string;
    count: number;
  }>;
};

const locationsFacet = [
  {
    $lookup: {
      from: LocationModel.collection.name,
      localField: "customerId",
      foreignField: "customerId",
      as: "locations",
    },
  },
  { $unwind: "$locations" },
  {
    $group: {
      _id: {
        city: "$locations.city",
        locationType: "$locations.locationType",
      },
      count: { $sum: 1 },
    },
  },
  {
    $project: {
      _id: 0,
      city: "$_id.city",
      locationType: "$_id.locationType",
      count: "$count",
    },
  },
];

const availableDaysFacet = [
  {
    $lookup: {
      from: ScheduleModel.collection.name,
      localField: "customerId",
      foreignField: "customerId",
      as: "schedules",
    },
  },
  { $unwind: "$schedules" },
  { $unwind: "$schedules.slots" },
  {
    $group: {
      _id: "$schedules.slots.day",
      count: { $sum: 1 },
    },
  },
  {
    $project: {
      _id: 0,
      day: "$_id",
      count: "$count",
    },
  },
];

const productDetailsFacet = [
  {
    $lookup: {
      from: ScheduleModel.collection.name,
      localField: "customerId",
      foreignField: "customerId",
      as: "schedules",
    },
  },
  { $unwind: "$schedules" },
  { $unwind: "$schedules.products" },
  {
    $group: {
      _id: {
        productHandle: "$schedules.products.productHandle",
        productId: "$schedules.products.productId",
      },
      count: { $sum: 1 },
    },
  },
  {
    $project: {
      _id: 0,
      productHandle: "$_id.productHandle",
      productId: "$_id.productId",
      count: "$count",
    },
  },
];

const specialitiesFacet = [
  { $unwind: "$specialties" },
  {
    $group: {
      _id: "$specialties",
      count: { $sum: 1 },
    },
  },
  {
    $project: {
      _id: 0,
      speciality: "$_id",
      count: "$count",
    },
  },
];

export const UserServiceFilters = async ({
  profession,
}: {
  profession?: string;
}) => {
  const results = await UserModel.aggregate<UserAggregationResult>([
    ...(profession
      ? [
          {
            $match: {
              professions: { $in: [profession] },
            },
          },
        ]
      : []),
    {
      $facet: {
        locations: locationsFacet,
        availableDays: availableDaysFacet,
        products: productDetailsFacet,
        specialties: specialitiesFacet,
      },
    },
  ]);

  return results[0];
};

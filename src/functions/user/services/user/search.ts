import { PipelineStage } from "mongoose";
import { Location, LocationModel } from "~/functions/location";

import { ScheduleModel, ScheduleSlot } from "~/functions/schedule";
import { UserModel } from "../../user.model";
import { User } from "../../user.types";

export type UserServiceSearchProps = {
  nextCursor?: Date | string;
  limit: number;
  filters?: {
    profession?: string;
    specialties?: string[];
    location?: Pick<Location, "city" | "locationType">;
    days?: Array<ScheduleSlot["day"]>;
    keyword?: string;
  };
  sortOrder?: "asc" | "desc";
};

export const UserServiceSearch = async (
  { nextCursor, limit, filters, sortOrder = "desc" }: UserServiceSearchProps = {
    limit: 10,
  }
) => {
  const pipeline: PipelineStage[] = [
    { $match: { active: true, isBusiness: true } },
  ];

  if (filters?.profession) {
    pipeline.push({
      $match: { professions: { $in: [filters.profession] } },
    });
  }

  if (filters?.keyword) {
    pipeline.push({
      $match: {
        $or: [
          { username: { $regex: filters.keyword, $options: "i" } },
          { fullname: { $regex: filters.keyword, $options: "i" } },
        ],
      },
    });
  }

  if (filters?.specialties && filters?.specialties.length > 0) {
    pipeline.push({ $match: { specialties: { $in: filters?.specialties } } });
  }

  if (filters?.location) {
    pipeline.push({
      $lookup: {
        from: LocationModel.collection.name,
        localField: "customerId",
        foreignField: "customerId",
        as: "locations",
      },
    });

    pipeline.push({
      $unwind: "$locations",
    });

    pipeline.push({
      $match: {
        "locations.city": filters.location.city,
        "locations.locationType": filters.location.locationType,
        "locations.deletedAt": null,
      },
    });
  }

  if (filters?.days && filters?.days.length > 0) {
    pipeline.push({
      $lookup: {
        from: ScheduleModel.collection.name,
        localField: "customerId",
        foreignField: "customerId",
        as: "schedules",
      },
    });

    pipeline.push({
      $match: {
        "schedules.slots.day": { $in: filters.days },
      },
    });

    pipeline.push({
      $match: {
        schedules: { $elemMatch: { slots: { $not: { $size: 0 } } } },
      },
    });
  }

  pipeline.push({
    $group: {
      _id: "$_id",
      name: { $first: "$name" },
      customerId: { $first: "$customerId" },
      username: { $first: "$username" },
      fullname: { $first: "$fullname" },
      specialties: { $first: "$specialties" },
      shortDescription: { $first: "$shortDescription" },
      images: { $first: "$images" },
      languages: { $first: "$languages" },
      createdAt: { $first: "$createdAt" },
      locations: { $push: "$locations" },
      schedules: { $push: "$schedules" },
    },
  });

  pipeline.push({
    $project: {
      _id: "$_id",
      name: 1,
      customerId: 1,
      username: 1,
      fullname: 1,
      specialties: 1,
      shortDescription: 1,
      images: 1,
      languages: 1,
      createdAt: 1,
      locations: 1,
      schedules: 1,
    },
  });

  pipeline.push({
    $facet: {
      results: [
        { $sort: { createdAt: sortOrder === "asc" ? 1 : -1 } },
        ...(nextCursor
          ? [
              {
                $match: {
                  createdAt:
                    sortOrder === "asc"
                      ? { $gt: new Date(nextCursor) }
                      : { $lt: new Date(nextCursor) },
                },
              },
            ]
          : []),

        { $limit: limit + 1 },
      ],
      totalCount: [{ $count: "count" }],
    },
  });

  const users = await UserModel.aggregate<{
    results: Array<
      User & { locations: Array<Pick<Location, "city" | "country">> }
    >;
    totalCount: Array<{ count: number } | undefined>;
  }>(pipeline);

  const results = users[0].results;
  const totalCount = users[0].totalCount[0] ? users[0].totalCount[0].count : 0;

  const hasNextPage = results.length > limit;
  const paginatedResults = hasNextPage ? results.slice(0, -1) : results;

  return {
    results: paginatedResults,
    nextCursor: hasNextPage
      ? paginatedResults[paginatedResults.length - 1].createdAt
      : undefined,
    totalCount,
  };
};

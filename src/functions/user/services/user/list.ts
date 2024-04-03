import { PipelineStage } from "mongoose";
import { Location, LocationModel } from "~/functions/location";

import { UserModel } from "../../user.model";
import { User } from "../../user.types";

export type UserServiceListProps = {
  nextCursor?: Date | string;
  limit: number;
  filters?: {
    profession?: string;
    specialties?: string[];
    location?: {
      city: string;
    };
  };
  sortOrder?: "asc" | "desc";
};

export const UserServiceList = async (
  { nextCursor, limit, filters, sortOrder = "desc" }: UserServiceListProps = {
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
      },
    });
  }

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
                      ? { $gt: nextCursor }
                      : { $lt: nextCursor },
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
    results: Array<User & { locations: Location }>;
    totalCount: Array<{ count: number } | undefined>;
  }>(pipeline);

  const results = users[0].results;
  const totalCount = users[0].totalCount[0] ? users[0].totalCount[0].count : 0;

  const hasNextPage = totalCount > limit;
  const paginatedResults = hasNextPage ? results.slice(0, -1) : results;

  return {
    results: paginatedResults,
    nextCursor: hasNextPage
      ? paginatedResults[paginatedResults.length - 1].createdAt
      : undefined,
    totalCount,
  };
};

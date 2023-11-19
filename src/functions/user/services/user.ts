import { FilterQuery } from "mongoose";
import { ILocationDocument } from "~/functions/location/schemas/location.schema";

import { NotFoundError } from "~/library/handler";
import { UserModel } from "../user.model";
import { IUserDocument } from "../user.schema";
import { User, UserLocations } from "../user.types";

export type UserServiceGetCustomerIdProps = Required<Pick<User, "username">>;

export const UserServiceGetCustomerId = ({ username }: UserServiceGetProps) => {
  return UserModel.findOne(
    { username, active: true, isBusiness: true },
    { customerId: 1 }
  )
    .lean()
    .orFail(
      new NotFoundError([
        {
          path: ["username"],
          message: "NOT_FOUND",
          code: "custom",
        },
      ])
    );
};

export type UserServiceGetProps = Required<Pick<User, "username">>;

export const UserServiceGet = ({ username }: UserServiceGetProps) => {
  return UserModel.findOne({ username, active: true, isBusiness: true })
    .lean()
    .orFail(
      new NotFoundError([
        {
          path: ["username"],
          message: "NOT_FOUND",
          code: "custom",
        },
      ])
    );
};

type UserServiceListProps = {
  nextCursor?: Date | string;
  limit?: number;
  profession?: string;
  sortOrder?: "asc" | "desc";
};

export const UserServiceList = async ({
  nextCursor,
  limit,
  profession,
  sortOrder = "desc",
}: UserServiceListProps = {}) => {
  let query: FilterQuery<IUserDocument> = { active: true, isBusiness: true };

  if (profession) {
    query = {
      ...query,
      professions: { $in: [profession] },
    };
  }

  const sortParam = sortOrder === "asc" ? 1 : -1; // 1 for 'asc', -1 for 'desc'

  if (nextCursor) {
    query = {
      ...query,
      createdAt: sortParam === 1 ? { $gt: nextCursor } : { $lt: nextCursor },
    };
  }

  const users = await UserModel.find(query)
    .sort({ createdAt: sortParam })
    .limit(limit || 10);

  return {
    results: users,
    nextCursor:
      users.length > 0 ? users[users.length - 1].createdAt : undefined,
  };
};

export const UserServiceProfessions = async () => {
  const professionCount = await UserModel.aggregate([
    { $unwind: "$professions" },
    {
      $group: {
        _id: "$professions",
        count: { $sum: 1 },
      },
    },
  ]);

  const professionCountFormatted: Record<string, number> = {};
  for (const profession of professionCount) {
    professionCountFormatted[profession._id] = profession.count;
  }

  return professionCountFormatted;
};

export const UserServiceLocationsAdd = async (location: {
  _id: ILocationDocument["_id"];
  customerId: number;
}) => {
  const user = await UserServiceFindCustomerOrFail(location);
  const isDefault = user.locations?.length === 0;
  user.locations?.push({ location: location._id.toString(), isDefault });
  return user.save();
};

export const UserServiceLocationsSetDefault = async (location: {
  _id: ILocationDocument["_id"];
  customerId: number;
}) => {
  const user = await UserServiceFindCustomerOrFail(location);

  const locationOldDefault = user.locations?.find((l) => l.isDefault);
  if (locationOldDefault && locationOldDefault.isDefault) {
    locationOldDefault.isDefault = false;
  }

  const locationToSetDefault = user.locations?.find(
    (l) => l.location.toString() === location._id.toString()
  );

  if (locationToSetDefault && !locationToSetDefault.isDefault) {
    locationToSetDefault.isDefault = true;
  }

  return user.save();
};

export const UserServiceLocationsRemove = async (location: {
  locationId: ILocationDocument["_id"];
  customerId: number;
}) => {
  const user = await UserServiceFindCustomerOrFail(location);
  // Get the location that will be removed
  const locationToRemove = user.locations?.find(
    (l) => l.location.toString() === location.locationId.toString()
  );

  if (locationToRemove && locationToRemove.isDefault) {
    // If the location is the default one, change isDefault flag on first non-default location
    const firstNonDefault = user.locations?.find(
      (l) =>
        l.location.toString() !== location.locationId.toString() && !l.isDefault
    );
    if (firstNonDefault) firstNonDefault.isDefault = true;
  }

  user.locations = user.locations?.filter(
    (l) => l.location.toString() !== location.locationId.toString()
  );
  return user.save();
};

export const UserServiceGetLocations = async <T>({
  customerId,
  username,
}: {
  customerId?: number;
  username?: string;
}) => {
  const pipeline = [];
  if (customerId) {
    pipeline.push({ $match: { customerId } });
  }

  if (username) {
    pipeline.push({ $match: { username } });
  }

  pipeline.push(
    { $unwind: "$locations" },
    {
      $lookup: {
        from: "Location",
        localField: "locations.location",
        foreignField: "_id",
        as: "locations.location",
      },
    },
    { $unwind: "$locations.location" },
    {
      $addFields: {
        "locations.location.isDefault": "$locations.isDefault",
        "locations.location.location": "$locations.location._id",
      },
    },
    {
      $group: {
        _id: "$_id",
        locations: { $push: "$locations.location" },
      },
    },
    {
      $project: {
        _id: 0,
        locations: 1,
      },
    }
  );

  const locations = await UserModel.aggregate<{
    locations: Array<UserLocations & T>;
  }>(pipeline).exec();
  if (locations.length > 0) {
    return locations[0].locations;
  }

  return [];
};

export const UserServiceFindCustomerOrFail = ({
  customerId,
}: {
  customerId: number;
}) => {
  return UserModel.findOne({
    customerId,
  }).orFail(
    new NotFoundError([
      {
        path: ["customerId"],
        message: "NOT_FOUND",
        code: "custom",
      },
    ])
  );
};

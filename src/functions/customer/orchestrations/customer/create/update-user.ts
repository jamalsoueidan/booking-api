import { UserModel } from "~/functions/user";

export const updateUser = async ({
  userId,
  collectionMetaobjectId,
  userMetaobjectId,
}: {
  userId: string;
  collectionMetaobjectId: string;
  userMetaobjectId: string;
}) => {
  return UserModel.updateOne(
    { _id: userId },
    {
      collectionMetaobjectId,
      userMetaobjectId,
    }
  );
};

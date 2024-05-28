import { UserModel } from "~/functions/user";

export const updateUserMetafieldsName = "updateUserMetafields";
export const updateUserMetafields = async ({
  userId,
  collectionMetaobjectId,
  userMetaobjectId,
  articleId,
}: {
  userId: string;
  collectionMetaobjectId: string;
  userMetaobjectId: string;
  articleId: number;
}) => {
  return UserModel.updateOne(
    { _id: userId },
    {
      collectionMetaobjectId,
      userMetaobjectId,
      articleId,
    }
  );
};

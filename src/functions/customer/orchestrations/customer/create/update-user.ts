import { UserModel } from "~/functions/user";

export const updateUser = async ({
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

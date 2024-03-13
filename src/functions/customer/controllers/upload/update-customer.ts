import { UserModel } from "~/functions/user";
import { connect } from "~/library/mongoose";
import { type FileGetQuery } from "~/types/admin.generated";

type Node = FileGetQuery["files"]["nodes"][number];
type PreviewType = NonNullable<Node["preview"]>;
type ImageType = NonNullable<PreviewType["image"]>;

type Props = {
  customerId: number;
  image: ImageType;
};

export async function updateCustomerHandler({ customerId, image }: Props) {
  await connect();

  const response = await UserModel.findOneAndUpdate(
    { customerId },
    {
      images: {
        profile: {
          ...image,
        },
      },
    }
  );

  return response;
}

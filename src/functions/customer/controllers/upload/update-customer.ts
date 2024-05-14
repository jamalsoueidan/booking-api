import { connect } from "~/library/mongoose";
import { type FileGetQuery } from "~/types/admin.generated";
import { CustomerServiceUpdate } from "../../services/customer/update";

type Node = FileGetQuery["files"]["nodes"][number];
type PreviewType = NonNullable<Node["preview"]>;
type ImageType = NonNullable<PreviewType["image"]>;

type Props = {
  customerId: number;
  profile: ImageType;
  metaobjectId: string;
};

export async function updateCustomerHandler({
  customerId,
  profile,
  metaobjectId,
}: Props) {
  await connect();

  return CustomerServiceUpdate(
    { customerId },
    {
      images: {
        profile: {
          metaobjectId: metaobjectId,
          url: profile.url,
          width: profile.width || 0,
          height: profile.height || 0,
        },
      },
    }
  );
}

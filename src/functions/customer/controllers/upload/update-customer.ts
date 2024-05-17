import { connect } from "~/library/mongoose";
import { CustomerServiceUpdate } from "../../services/customer/update";

type Props = {
  customerId: number;
  profile: {
    url: string;
    width: number;
    height: number;
  };
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

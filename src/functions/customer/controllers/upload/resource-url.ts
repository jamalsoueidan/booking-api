import { z } from "zod";
import { LocationZodSchema } from "~/functions/location/location.types";
import { _ } from "~/library/handler";
import { shopifyAdmin } from "~/library/shopify";

export type CustomerUploadControllerResourceURLRequest = {
  query: z.infer<typeof CustomerUploadControllerResourceURLQuerySchema>;
};

export const CustomerUploadControllerResourceURLQuerySchema = z
  .object({
    customerId: LocationZodSchema.shape.customerId,
  })
  .strip();

export type CustomerUploadControllerResourceURLResponse = Awaited<
  ReturnType<typeof CustomerUploadControllerResourceURL>
>;

export const CustomerUploadControllerResourceURL = _(
  async ({ query }: CustomerUploadControllerResourceURLRequest) => {
    const validateData =
      CustomerUploadControllerResourceURLQuerySchema.parse(query);
    const { data } = await shopifyAdmin().request(UPLOAD_CREATE, {
      variables: {
        input: [
          {
            resource: "IMAGE" as any,
            filename: `${
              validateData.customerId
            }_customer_profile_${new Date().getTime()}.jpg`,
            mimeType: "image/jpeg",
            httpMethod: "POST" as any,
          },
        ],
      },
    });

    if (
      !data ||
      !data.stagedUploadsCreate ||
      !data?.stagedUploadsCreate?.stagedTargets
    ) {
      throw new Error("something went wrong with uploading image");
    }

    return data?.stagedUploadsCreate?.stagedTargets[0];
  }
);

const UPLOAD_CREATE = `#graphql
  mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets {
        resourceUrl
        url
        parameters {
          name
          value
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

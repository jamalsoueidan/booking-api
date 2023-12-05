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
    const data = CustomerUploadControllerResourceURLQuerySchema.parse(query);
    const response = await shopifyAdmin.query<UploadMutationResponse>({
      data: {
        query: UPLOAD_CREATE,
        variables: {
          input: [
            {
              resource: "IMAGE",
              filename: `${
                data.customerId
              }_customer_profile_${new Date().getTime()}.jpg`,
              mimeType: "image/jpeg",
              httpMethod: "POST",
            },
          ],
        },
      },
    });

    return response.body.data.stagedUploadsCreate.stagedTargets[0];
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

type UploadMutationResponse = {
  data: {
    stagedUploadsCreate: {
      stagedTargets: Array<{
        resourceUrl: string;
        url: string;
        parameters: Array<{
          name: string;
          value: string;
        }>;
      }>;
      userErrors: Array<any>;
    };
  };
  extensions: {
    cost: {
      requestedQueryCost: number;
      actualQueryCost: number;
      throttleStatus: {
        maximumAvailable: number;
        currentlyAvailable: number;
        restoreRate: number;
      };
    };
  };
};

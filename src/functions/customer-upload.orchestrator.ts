import {
  app,
  HttpHandler,
  HttpRequest,
  HttpResponse,
  InvocationContext,
} from "@azure/functions";
import * as df from "durable-functions";
import { OrchestrationContext } from "durable-functions";
import { z } from "zod";
import { connect } from "~/library/mongoose";
import { shopifyAdmin } from "~/library/shopify";
import { NumberOrStringType } from "~/library/zod";
import { FileGetQuery } from "~/types/admin.generated";
import { FileContentType } from "~/types/admin.types";
import { CustomerUploadControllerResourceURL } from "./customer/controllers/upload/resource-url";
import { UserModel } from "./user";

function getFilenameFromUrl(url: string) {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  const segments = pathname.split("/");
  return segments.pop(); // Returns the last segment of the pathname
}

const bodySchema = z.object({
  customerId: NumberOrStringType,
  resourceUrl: z.string().url(),
});

type Body = z.infer<typeof bodySchema>;

df.app.orchestration("upload", function* (context: OrchestrationContext) {
  const body = context.df.getInput() as Body;

  const zodParse = bodySchema.safeParse(body);
  if (!zodParse.success) {
    context.error("Error parsing request body:", zodParse.error);
    return { sucess: false, error: zodParse.error };
  }

  yield context.df.callActivity("fileCreate", body);

  const maxRetries = 5;
  let attemptCount = 0;
  let fileUploaded: FileGetQuery["files"]["nodes"][number] | undefined;

  while (!fileUploaded && attemptCount < maxRetries) {
    // Wait for 5 seconds before each new attempt
    const nextCheckTime = new Date(
      context.df.currentUtcDateTime.getTime() + 3 * 1000 // try every 3 seconds
    );
    yield context.df.createTimer(nextCheckTime);

    // Check if data is available from Shopify
    const response: Awaited<ReturnType<typeof fileGet>> =
      yield context.df.callActivity("fileGet", body);
    if (response && response.files.nodes.length > 0) {
      fileUploaded = response.files.nodes[0];
    }

    attemptCount++;
  }

  if (fileUploaded) {
    return yield context.df.callActivity("updateCustomer", {
      customerId: body.customerId,
      image: fileUploaded.preview?.image,
    });
  }

  context.error(`Data for ${body.customerId} not available after retries.`);

  return {
    failed: true,
  };
});

type Node = FileGetQuery["files"]["nodes"][number];
type PreviewType = NonNullable<Node["preview"]>;
type ImageType = NonNullable<PreviewType["image"]>;

type updateCustomer = {
  customerId: number;
  image: ImageType;
};

df.app.activity("updateCustomer", {
  handler: async ({ customerId, image }: updateCustomer) => {
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
  },
});

async function fileCreate(input: Body) {
  const { data } = await shopifyAdmin.request(FILE_CREATE, {
    variables: {
      files: {
        alt: getFilenameFromUrl(input.resourceUrl),
        contentType: FileContentType.Image,
        originalSource: input.resourceUrl,
      },
    },
  });

  return data;
}

df.app.activity("fileCreate", {
  handler: fileCreate,
});

async function fileGet(input: Body) {
  const { data } = await shopifyAdmin.request(FILE_GET, {
    variables: {
      query: getFilenameFromUrl(input.resourceUrl) || "",
    },
  });

  return data;
}

df.app.activity("fileGet", {
  handler: fileGet,
});

const uploadHttpStart: HttpHandler = async (
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponse> => {
  const client = df.getClient(context);
  const body: unknown = await request.json();

  const instanceId: string = await client.startNew(
    request.params.orchestratorName,
    { input: body }
  );

  context.log(`Started orchestration with ID = '${instanceId}'.`);
  return client.createCheckStatusResponse(request, instanceId);
};

app.http("uploadHttpStart", {
  route: "orchestrators/{orchestratorName}",
  extraInputs: [df.input.durableClient()],
  handler: uploadHttpStart,
});

app.http("uploadResourceRequest", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/upload/resource-url",
  handler: CustomerUploadControllerResourceURL,
});

const FILE_CREATE = `#graphql
  mutation fileCreate($files: [FileCreateInput!]!) {
    fileCreate(files: $files) {
      files {
        fileStatus
        alt
      }
      userErrors {
        field
        message
      }
    }
  }
` as const;

const FILE_GET = `#graphql
  query FileGet($query: String!) {
    files(first: 10, sortKey: UPDATED_AT, reverse: true, query: $query) {
      nodes {
        preview {
          image {
            url
            width
            height
          }
        }
      }
    }
  }
` as const;

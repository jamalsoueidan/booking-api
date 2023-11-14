import {
  FunctionResult,
  HttpRequest,
  HttpResponse,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { ZodError } from "zod";
import { connect } from "../mongoose";
import {
  BadError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "./errors";

export type AzureHandler = (
  request: HttpRequest,
  context: InvocationContext
) => FunctionResult<HttpResponseInit | HttpResponse | void>;

export type CustomHandler = (props: any) => unknown;

export type MiddlewareFunctions = AzureHandler | CustomHandler;

export const _ =
  (...middlewares: MiddlewareFunctions[]) =>
  async (request: HttpRequest, context: InvocationContext) => {
    try {
      // connect db
      await connect();

      for (const handler of middlewares) {
        let response;
        if (isAzureHandler(handler)) {
          response = await handler(request, context);
        } else {
          response = await executeControllerWithParams(
            request,
            handler,
            context
          );
        }

        if (response) {
          context.trace("Response body: ", JSON.stringify(response));
          return { jsonBody: { payload: response, success: true } };
        }
      }
    } catch (err: unknown) {
      const props: HttpResponseInit = {};
      if (
        err instanceof UnauthorizedError ||
        err instanceof ZodError ||
        err instanceof NotFoundError ||
        err instanceof ForbiddenError ||
        err instanceof BadError
      ) {
        props.jsonBody = { errors: err.issues, success: false };
        props.status = (err as any).status || 400; // zodError doesn't have status
        context.error("Zod error: ", props);
        return props;
      }

      props.jsonBody = { errors: err, succes: false };
      props.status = 500;
      context.error("Unknown error: ", props);
      return props;
    }

    return { status: 404 };
  };

const executeControllerWithParams = async (
  request: HttpRequest,
  handler: Function,
  context: InvocationContext
) => {
  const getQueries = () => {
    const queryUsed = Object.fromEntries(request.query.entries());
    return Object.keys(queryUsed).length > 0 ? queryUsed : {};
  };

  const getBody = async () => {
    try {
      const bodyData = (await request.json()) as object;
      return bodyData;
    } catch (error) {
      throw new BadError([
        { path: ["body"], message: "Require body", code: "custom" },
      ]);
    }
  };

  const requiredParams = getFunctionParameters(handler);
  const params: { [key: string]: any } = {};

  if (requiredParams.includes("query")) {
    params.query = getQueries();
    if (request.params) {
      params.query = { ...params.query, ...request.params };
    }
  }
  if (requiredParams.includes("body")) {
    params.body = await getBody();
  }

  context.trace("Request body", params);

  return handler(params);
};

const isAzureHandler = (handler: any): handler is AzureHandler =>
  parameterExists(handler, "request");

const getFunctionParameters = (functionToCheck: Function): string[] => {
  const functionAsString = functionToCheck.toString();
  const functionParameters =
    functionAsString.match(/function\s.*?\(([^)]*)\)/)?.[1] ||
    functionAsString.match(/(?:\s|^)\(([^)]*)\)\s*=>/)?.[1] ||
    functionAsString.match(/(?:\s|^)([^=]*?)\s*=>/)?.[1];

  if (!functionParameters) {
    return [];
  }

  return functionParameters
    .replace(/[{}]/g, "") // Remove curly brackets
    .split(",")
    .map((param) => param.trim())
    .filter((param) => param.length > 0);
};

const parameterExists = (
  functionToCheck: Function,
  paramName: string
): boolean => {
  const functionParameters = getFunctionParameters(functionToCheck);
  return functionParameters.includes(paramName);
};

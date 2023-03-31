import {
  FunctionResult,
  HttpRequest,
  HttpResponse,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { ZodError } from "zod";
import { connect } from "../db";
import { jwtDecode, jwtGetToken } from "../jwt";

export type MiddlewareHandlerAzure = (
  request: HttpRequest,
  context: InvocationContext
) => FunctionResult<HttpResponseInit | HttpResponse | void>;

export type MiddlewareHandlerExternal = (props: any) => unknown;

export type MiddlewareHandlerFunction =
  | MiddlewareHandlerAzure
  | MiddlewareHandlerExternal;

export const _ =
  (...middlewares: MiddlewareHandlerFunction[]) =>
  async (request: HttpRequest, context: InvocationContext) => {
    try {
      // connect db
      await connect();

      for (const handler of middlewares) {
        const response = isAzureHandler(handler)
          ? await handler(request, context)
          : await executeControllerWithParams(request, handler);

        if (response) {
          return { jsonBody: { payload: response, success: true } };
        }
      }
    } catch (err: unknown) {
      const props: HttpResponseInit = {};
      if (err instanceof Error) {
        props.jsonBody = { error: err.message, success: false };
        props.status = 404;
      }

      if (err instanceof ZodError) {
        props.jsonBody = { error: err.issues, success: false };
        props.status = 400;
      }

      return props;
    }

    return { status: 404 };
  };

const executeControllerWithParams = async (
  request: HttpRequest,
  handler: Function
) => {
  const shop = request.headers.get("shop") || request.query.get("shop") || null;

  const getSession = async () => {
    const token = jwtGetToken(request.headers);
    return token ? await jwtDecode(token) : {};
  };

  const getQueries = () => {
    const queryUsed = Object.fromEntries(request.query.entries());
    return Object.keys(queryUsed).length > 0 ? { ...queryUsed, shop } : {};
  };

  const getBody = async () => {
    try {
      const bodyData = (await request.json()) as object;
      return { ...bodyData, shop };
    } catch (error) {
      throw new Error("Require body");
    }
  };

  const requiredParams = getFunctionParameters(handler);
  const params: { [key: string]: any } = {};

  if (requiredParams.includes("query")) {
    params.query = getQueries();
  }
  if (requiredParams.includes("body")) {
    params.body = await getBody();
  }
  if (requiredParams.includes("session")) {
    params.session = await getSession();
  }

  return handler(params);
};

const isAzureHandler = (handler: any): handler is MiddlewareHandlerAzure =>
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
  const functionAsString = functionToCheck.toString();
  const parameterRegex = new RegExp(`\\b${paramName}\\b`, "g");
  const functionParameters =
    functionAsString.match(/function\s.*?\(([^)]*)\)/)?.[1] ||
    functionAsString.match(/(?:\s|^)\(([^)]*)\)\s*=>/)?.[1] ||
    functionAsString.match(/(?:\s|^)([^=]*?)\s*=>/)?.[1];

  if (!functionParameters) {
    return false;
  }

  return parameterRegex.test(functionParameters);
};

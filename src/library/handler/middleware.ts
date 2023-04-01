import {
  FunctionResult,
  HttpRequest,
  HttpResponse,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { ZodError } from "zod";
import { jwtDecode, jwtGetToken } from "../jwt";
import { connect } from "../mongoose";

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
        let response = isAzureHandler(handler)
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
      }

      if (err instanceof ZodError) {
        props.jsonBody = { error: err.issues, success: false };
      }
      props.status = 400;
      return props;
    }

    return { status: 404 };
  };

const executeControllerWithParams = async (
  request: HttpRequest,
  handler: Function
) => {
  const getSession = async () => {
    const token = jwtGetToken(request.headers);
    return token ? await jwtDecode(token) : {};
  };

  const getQueries = () => {
    const queryUsed = Object.fromEntries(request.query.entries());
    return Object.keys(queryUsed).length > 0 ? queryUsed : {};
  };

  const getBody = async () => {
    try {
      const bodyData = (await request.json()) as object;
      return bodyData;
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

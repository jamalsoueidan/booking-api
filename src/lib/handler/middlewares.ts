import {
  FunctionResult,
  HttpRequest,
  HttpResponse,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
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

      // build object {query,body,session}
      const object = await buildObjectController(request);

      // go through each controller method
      for (const handler of middlewares) {
        const response = isInternal(handler)
          ? await handler(request, context)
          : await handler(object);

        // any response from handler, send back to user and exist
        if (response) {
          return { jsonBody: { payload: response, success: true } };
        }
      }
    } catch (error) {
      // try to create different custom httpError with specific errors like HttpUnauthorize or HttpError, httpValidation
      // context.log("error", error);
      const props: HttpResponseInit = { status: 402 };
      if (typeof error === "object")
        props.jsonBody = { payload: { error }, success: false };
      return props;
    }

    return { status: 404, jsonBody: { test: "a" } };
  };

const buildObjectController = async (request: HttpRequest) => {
  try {
    const token = jwtGetToken(request.headers);
    const session = token ? await jwtDecode(token) : {};
    const shop =
      request.headers.get("shop") || request.query.get("shop") || null;

    const queryUsed = Object.fromEntries(request.query.entries());
    const query =
      Object.keys(queryUsed).length > 0 ? { ...queryUsed, shop } : {};

    const body = request.bodyUsed
      ? { ...((await request.json()) as object), shop }
      : {};

    return {
      query,
      body,
      session,
    };
  } catch (error) {
    console.log(error);
  }
};

// figure out if this is internal endpoint handler?
const isInternal = (controller: any): controller is MiddlewareHandlerAzure => {
  const params = getParamNames(controller);
  return params.includes("request");
};

// get method params
const getParamNames = (func: Function) => {
  const funcStr = func.toString();
  const paramMatch = funcStr.match(/\(([^)]*)\)/);
  if (!paramMatch) {
    return [];
  }
  const paramNames = paramMatch[1]
    .replace(/\/\*.*?\*\//g, "") // Remove comments.
    .replace(/\s+/g, "") // Remove spaces.
    .split(",");

  return paramNames;
};

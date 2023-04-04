import {
  HttpRequest,
  HttpRequestInit,
  HttpResponseInit,
  InvocationContext,
  InvocationContextInit,
} from "@azure/functions";
import { AuthRole } from "../../../functions/auth/auth.types";
import { login } from "../helpers";

export interface HttpSuccessResponse<T = unknown> extends HttpResponseInit {
  jsonBody?: {
    payload: T;
    success: boolean;
  };
}

export interface HttpErrorResponse extends HttpResponseInit {
  jsonBody?: {
    error: string;
    success: boolean;
  };
}

export interface HttpRequestObject extends HttpRequestInit {
  body?: {};
}

export class MockHttpRequest extends HttpRequest {
  mockedBody? = {};

  constructor(httpRequestInit: HttpRequestObject = {}) {
    const {
      headers = {},
      query = {},
      body = undefined,
      method = "GET",
      params = {},
      url = "http://www.test.dk",
      ...otherInit
    } = httpRequestInit;

    super({
      ...otherInit,
      headers,
      query,
      body,
      url,
      method,
    });

    this.mockedBody = body;
  }

  arrayBuffer = jest.fn(async () => new ArrayBuffer(0));
  json = async () => this.mockedBody;
  text = jest.fn(async () => "");
}

type PickByValueType<T, ValueType> = Pick<
  T,
  { [K in keyof T]-?: T[K] extends ValueType ? K : never }[keyof T]
>;

export type HandlerProps<
  T extends {
    query?: any;
    body?: any;
    params?: any;
  }
> = PickByValueType<T, object> & {
  headers?: any;
  login?: AuthRole;
};

export async function createHttpRequest<
  T extends {
    query?: any;
    body?: any;
    params?: any;
  } = {}
>(props: HandlerProps<T>): Promise<HttpRequest> {
  if (props?.login) {
    const token = await login(props.login);
    props.headers = { ...props?.headers, authorization: `Bearer: ${token}` };
  }
  return new MockHttpRequest(props);
}

export class MockInvocationContext extends InvocationContext {
  constructor(init?: InvocationContextInit) {
    super(init);
  }

  log = jest.fn();
  trace = jest.fn();
  debug = jest.fn();
  info = jest.fn();
  warn = jest.fn();
  error = jest.fn();
}

export function createContext(init?: InvocationContextInit): InvocationContext {
  return new MockInvocationContext(init);
}

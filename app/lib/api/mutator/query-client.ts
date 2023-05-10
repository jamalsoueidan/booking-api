// custom-instance.ts

const baseURL = "https://booking-shopify-api.azurewebsites.net/api"; // use your own URL here or environment variable

// In some case with react-query and swr you want to be able to override the return error type so you can also do it here like this
export type ErrorType<ErrorData> = ErrorData;
// In case you want to wrap the body type (optional)
// (if the custom instance is processing data before sending it, like changing the case for example)
export type BodyType<BodyData> = BodyData & { headers?: any };

function paramsToQueryString(params: Record<string, string | Date>) {
  if (!params) {
    return "";
  }
  const queryString = Object.keys(params)
    .map((key) => {
      let value = params[key];
      if (value instanceof Date) {
        value = value.toJSON();
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join("&");

  return `?${queryString}`;
}

export const queryClient = async <T>({
  url,
  method,
  headers,
  params,
  data,
}: {
  url: string;
  method: "get" | "post" | "put" | "delete" | "patch";
  params?: any;
  headers?: any;
  data?: BodyType<unknown>;
  responseType?: string;
}): Promise<T> => {
  const response = await fetch(
    `${baseURL}${url.replace(/gid:\/\/shopify\/[A-Za-z]+\//, "")}` +
      paramsToQueryString(params),
    {
      method,
      headers,
      ...(data ? { body: JSON.stringify(data) } : {}),
    }
  );

  const responseJson = await response.json();
  return responseJson as T;
};

export default queryClient;

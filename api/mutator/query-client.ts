// custom-instance.ts

const baseURL = "<BACKEND URL>"; // use your own URL here or environment variable

// In some case with react-query and swr you want to be able to override the return error type so you can also do it here like this
export type ErrorType<ErrorData> = ErrorData;
// In case you want to wrap the body type (optional)
// (if the custom instance is processing data before sending it, like changing the case for example)
export type BodyType<BodyData> = BodyData & { headers?: any };

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
    `${baseURL}${url}` + new URLSearchParams(params),
    {
      method,
      ...(data ? { body: JSON.stringify(data) } : {}),
    }
  );

  return response.json();
};

export default queryClient;

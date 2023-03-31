# Controller

You need to decide which type of controller method you want to use.

Standard: (AzureMiddleware)

```js
export const method = async (
  request: HttpRequest,
  context: InvocationContext
) => {};
```

Express:

```js
export const method = async ({ query, body, session }) => {};
```

The Express method allows you to specify the required props, such as query, body, or session.

```js
export const method = async ({ query }) => {};
```

Choose the appropriate combination depending on the use case.

```js
export const method = async ({ query, body }) => {};
```

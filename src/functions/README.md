# How to create Azure Function?

Let's go

## Functions

Each new HTTP trigger function is associated with a controller method.

### Define HTTP Trigger

You define new method as usual.

But in the handler, you can use the specific underscore method that call all handler until one return the http response.

```js
app.http("account", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "account",
  handler: _(jwtVerify, getAccount),
});
```

## Handler

You need to decide which type of handler you want to use.

Azure Handler

```js
export const azureHandler = async (
  request: HttpRequest,
  context: InvocationContext
) => {};
```

Custom Handler:

```js
export const customHandler = async ({ query, body, session }) => {};
```

The custom handler allows you to specify the required props, such as query, body, or session.

```js
export const customHandler = async ({ query }) => {};
```

Choose the appropriate combination depending on the use case.

```js
export const method = async ({ query, body }) => {};
```

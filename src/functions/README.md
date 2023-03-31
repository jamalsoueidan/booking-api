# Functions

Each new HTTP trigger function is associated with a controller method.

## Define HTTP Trigger

You define new method as usual.

But in the handler, you can use our specific underscore method that call all methods until one return the http response.

```js
app.http("account", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "account",
  handler: _(jwtVerify, getAccount),
});
```

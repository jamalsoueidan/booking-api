# Booking Api

The API specification can be seen hosted at [https://jamalsoueidan.github.io/booking-api](https://jamalsoueidan.github.io/booking-api)

Download Openapi 3.x definition [https://github.com/jamalsoueidan/booking-shopify-api/blob/main/docs/openapi.yaml](https://github.com/jamalsoueidan/booking-shopify-api/blob/main/docs/openapi.yaml)

## Azure Functions

I previously started using Node/Express to develop all api endpoints, which were hosted on Heroku. But with the configuration I had to mantain, and all that comes with Node and Express I choose to move forward to Azure Functions.

This allows me to primarily focus on the endpoints, rather than managing the Node Express server with its associated plugins and middlewares etc.

Beside that I'm using Durable Functions which is an extension of Azure Fucntions, which can be long-running, and can call other durable functions synchronously and asynchronously which is great, I use when I need to upload image to shopify.

I'm planning also to use Azure queue storage to handle webhooks data processing.

## 1. Edit local.settings.json.example

Assign the correct value to all env values and rename to local.settings.json

## 2. Add Carrier

You have to add carrier service to shopify, so it can calculate location distance.

POST https://{shop}.myshopify.com/admin/api/2022-10/carrier_services.json

```json
{
  "carrier_service": {
    "name": "Beauty Shipping",
    "callback_url": "https://{apiURL}/api/shipping/rates",
    "service_discovery": true
  }
}
```

Then you need to add the carrier in the "Shipping and delivery" inside shopify Settings
https://admin.shopify.com/store/{shopName}/settings

## 3. Add Webhooks

You need to add order update and creation webhooks callback in the notifications.
https://admin.shopify.com/store/bysistersdk/settings/notifications (scroll bottom)

Create webhook order update: https://{apiUrl}/api/webhooks/order
Create webhook order creation: https://{apiUrl}/api/webhooks/order

## OpenAPI fragments and components (openapi/)

These files are part of the OpenAPI definition but not yet bundled together. These individual files contain different parts of the API specification, such as paths, schemas, or security definitions. These components are organized in a modular way, making it easier to maintain and update the API documentation.

### Bundle openapi

npm run bundle

## Github Actions

### pull request

1. Running all specs (jest)

### main branch

1. Bundle openapi fragments and generating the api documentation page
2. Deploy docs folder to pages
3. Deploy Azure functions to production

## Postman

In case you need to import openapi def in postman you can use this script to set token in your env after login.

Please create new environment or else below code will not work.

```js
let responseJson = pm.response.json();
let token = responseJson.payload.token;
pm.environment.set("bearerToken", token);
```

## Index.ts

We try to NOT export all internal files from index folder file because we would like to mock single methods in jest.
It's eaiser when not using index file.

## What's included

- Azure Functions
- Azure Durable
- Google Map
- Shopify Api
- Mongoose (MongoDB)
- Zod (validation)
- DateFns
- Openapi
- Orval

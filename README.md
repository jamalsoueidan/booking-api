# Booking Api

The Booking API is built on top of the Shopify GraphQL API. We're reducing the number of calls to the Booking API by using Shopify metafields and search filters.

For each user, we create a new collection that contains all their services. We also create mock products that users can duplicate. These products come pre-set with metafields and are ready to be modified. Additionally, we have organized universal services into specific collections; for example, the "Hairstylist" collection includes services related to hairstyling.

TODO:

- We need to move the **booking time** to the browser, returning only the booked time range.
- We need to determine if we can store user data in Shopify content metafields.

## Setup

_The guide is not complete, since there is some metafields that needs to be setup in each product._

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

You need to create webhooks callback in the notifications.
https://admin.shopify.com/store/bysistersdk/settings/notifications (scroll bottom on notification page, click webhooks)

_Order update:_
https://{apiUrl}/api/webhooks/order

_Crder creation:_
https://{apiUrl}/api/webhooks/order

_Product update:_
https://{apiUrl}/api/webhooks/product

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
